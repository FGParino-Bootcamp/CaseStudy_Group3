sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    '../model/formatter',
    'sap/m/MessageBox'
], function (Controller, JSONModel, Filter, FilterOperator, Formatter, MessageBox) {
        "use strict";
        return Controller.extend("casestudy.training.casestudyg3.controller.MainPage", {
            formatter:Formatter,
            onInit: function() {   
                let oTable = this.byId("OrderTable");
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
                let oView  = this.getView();
                let oTable = oView.byId("OrderTable");
                if (oTable) {
                    let oBinding = oTable.getBinding("items");
                    let aFilters = [];
                    let sOrder = oView.byId("idInpOrder");
                    let sOrderValue = sOrder.getValue();
                    if (sOrderValue) {
                        aFilters.push(new Filter("OrderID", FilterOperator.EQ, sOrderValue));
                    }
                    let sCDate = oView.byId("idInpCreDate");
                    let sDateValue = sCDate.getValue();
                    if (sDateValue) {
                        aFilters.push(new Filter("CreationDate", FilterOperator.EQ, sDateValue));
                    } 
                    let sStatus = oView.byId("idInpStatus");
                    let sStatusValue = sStatus.getSelectedKeys();   
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
                let oView  = this.getView();
                let oTable = oView.byId("OrderTable");
                
                let oBinding = oTable.getBinding("items");
                let aFilters = [];
                oBinding.filter(aFilters);  

                let sOrder = oView.byId("idInpOrder");
                if (sOrder) {
                    sOrder.setValue("");
                }
                let sCDate = oView.byId("idInpCreDate");
                if (sCDate) {
                    sCDate.setValue("");
                }
                let sStatus = oView.byId("idInpStatus");
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
                let oSelectedItem= oEvent.getSource();
                if (oSelectedItem) {
                    var oSelectedObject = oSelectedItem.getBindingContext().getObject();
                    var sSelectedKey = oSelectedObject.OrderID;
                }
                //Navigate to Display Page
                let oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteDisplayPage", { OrderID: sSelectedKey });
            },
            onDeleteOrder: function () {
                let oView  = this.getView();
                let oTable = oView.byId("OrderTable");
                let oSelectedItems = oTable.getSelectedItems();
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
                let sAction = fragment.getProperty("/actionDelete");
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
                let oView  = this.getView();
                let oTable = oView.byId("OrderTable");
                var oModel = this.getOwnerComponent().getModel();
                let oSelectedItems = oTable.getSelectedItems();
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