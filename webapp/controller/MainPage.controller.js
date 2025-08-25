sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    '../model/formatter',
    'sap/m/MessageBox',
    'sap/ui/core/date/UI5Date'
], function (Controller, JSONModel, Filter, FilterOperator, Formatter, MessageBox, Date) {
        "use strict";
        return Controller.extend("casestudy.training.casestudyg3.controller.MainPage", {
            formatter:Formatter,
            onInit: function() {   
                var oTable = this.byId("OrderTable");
                oTable.attachUpdateFinished(function(oEvent) {
                    let iCount = oEvent.getParameter("total");
                    let oCount = this.byId("idOrderCount"); 
                    if (oCount) {
                    oCount.setText("Orders(" + iCount + ")");
                    }
                }.bind(this));  
                var globalVar = new JSONModel({ 
                    actionDelete: false,
                    text:         ""
            });
                this.getView().setModel(globalVar, "FragmentData");      
            },

            onSearch: function () {
                var oView  = this.getView();
                var oTable = oView.byId("OrderTable");
                if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    var aFilters = [];
                    var sOrder = oView.byId("idInpOrder");
                    var sOrderValue = sOrder.getValue();
                    if (sOrderValue) {
                        aFilters.push(new Filter("OrderID", FilterOperator.EQ, sOrderValue));
                    }
                    var sCDate = oView.byId("idInpCreDate");
                    var sDateValue = sCDate.getDateValue();
                    if (sDateValue) {
                        //let iMilliseconds = sDateValue.getTime();
                        //let odataDateFormat = "/Date(" + iMilliseconds + ")/";
                        //var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
                        //var sFormattedDate = oDateFormat.format(sDateValue);
                        var sIsoStringUTC = sDateValue.toISOString();
                        var oCurrentDate = Date.getInstance();
                        var sIsoStringUTC2 = oCurrentDate.toISOString();
                        
                        aFilters.push(new Filter("CreationDate", FilterOperator.BT, sIsoStringUTC, sIsoStringUTC2 ));
                    } 
                    var sStatus = oView.byId("idInpStatus");
                    var sStatusValue = sStatus.getSelectedKeys();   
                    if (sStatusValue) {
                        for (var i = 0; i < sStatusValue.length; i++) {
                                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatusValue[i]));  
                            }
                    }   
                    if (aFilters) {
                        oBinding.filter(aFilters);                       
                    }

                }
		    },
            onClear: function () {
                var oView  = this.getView();
                var oTable = oView.byId("OrderTable");
                var oBinding = oTable.getBinding("items");
                var aFilters = [];
                oBinding.filter(aFilters);  

                var sOrder = oView.byId("idInpOrder");
                if (sOrder) {
                    sOrder.setValue("");
                }
                var sCDate = oView.byId("idInpCreDate");
                if (sCDate) {
                    sCDate.setValue("");
                }
                var sStatus = oView.byId("idInpStatus");
                if (sStatus) {
                    sStatus.setSelectedKeys([]);
                }
            },
            onAddOrder: function () {
                //Navigate to Create Page
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteCreatePage");            
            },
            onSelectOrder: function (oEvent) {
                var oSelectedItem= oEvent.getSource();
                if (oSelectedItem) {
                    var oSelectedObject = oSelectedItem.getBindingContext().getObject();
                    var sSelectedKey = oSelectedObject.OrderID;
                }
                //Navigate to Display Page
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteDisplayPage", { OrderID: sSelectedKey });
            },
            onDeleteOrder: function () {
                var oView  = this.getView();
                var oTable = oView.byId("OrderTable");
                var oSelectedItems = oTable.getSelectedItems();
                if (oSelectedItems.length === 0) {
                    MessageBox.show("Please select an item from the table.",
                        {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [MessageBox.Action.OK], // Optional: Define actions (e.g., OK, YES, NO)
                        } );

                } else {
                    let sFragmentData = this.getView().getModel("FragmentData");
                    sFragmentData.setProperty("/actionDelete", true);
                    this.onConfirm(oSelectedItems.length, sFragmentData); 
                }

            },
            onConfirm: function (count, fragment) {  
                var sAction = fragment.getProperty("/actionDelete");
                if (sAction) {
                    fragment.setProperty("/text", "Are you sure you want to delete " + count + " item(s)?");              
                }
                if (!this.oConfDialog) {
                    this.oConfDialog = this.loadFragment({
                        name: "casestudy.training.casestudyg3.fragment.ConfirmationDialog"
                    });
                }
                this.oConfDialog.then(function(oConfirmationDelete) {
                    oConfirmationDelete.open();
                });
            },

            onYes: function (oEvent) {
                var oView  = this.getView();
                var oTable = oView.byId("OrderTable");
                var oModel = this.getOwnerComponent().getModel();
                var oSelectedItems = oTable.getSelectedItems();
                if (oSelectedItems.length > 0) {

                    oSelectedItems.forEach(function(oItem) {
                        let sPath = oItem.getBindingContextPath();
                        
                        oModel.remove(sPath, {  
                                        success: function (oData, oResponse) {
                                            oModel.refresh(true);
                                        },
                                        error: function (oError){
                                        }
                                    });
                    });
                }
                this.getView().byId("idConfirmationDialog").close();
            },

            onNo: function () {
                this.getView().byId("idConfirmationDialog").close();
            }

        });
    });