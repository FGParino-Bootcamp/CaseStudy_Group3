sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    '../model/formatter',
    'sap/m/MessageBox',
    'sap/ui/core/format/DateFormat',
], function (Controller, JSONModel, Filter, FilterOperator, Formatter, MessageBox, DateFormat) {
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
                //Trying out fragment/passing of data via JSON Model 
                var globalVar = new JSONModel({ 
                    actionDelete: false,
                    text:         ""
            });
                this.getView().setModel(globalVar, "FragmentData");      
            },

            onSearch: function () {
                this.fnValidateOrder();
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
                        var milliseconds = sDateValue.getTime();
                        var oDateFormat = DateFormat.getDateInstance({pattern: "yyyyMMdd"});
                        var sFormattedDate = oDateFormat.format(sDateValue);
                        aFilters.push(new Filter("ConvertedDate", FilterOperator.EQ, sFormattedDate ));
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
            fnValidateOrder: function() {
                var oView  = this.getView();
                var sOrder = oView.byId("idInpOrder");
                var sOrderValue = sOrder.getValue();
                if (isNaN(sOrderValue)) {
                    MessageBox.show("Invalid Order Input.Please enter a number.",
                        {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [MessageBox.Action.OK],
                        } );                    
                }
                var sCDate = oView.byId("idInpCreDate");
                var sDateValue = sCDate.getDateValue();
                if (sDateValue===null) {
                    MessageBox.show("Invalid Date Input. Please enter valid date.",
                        {
                            icon: MessageBox.Icon.ERROR,
                            title: "Error",
                            actions: [MessageBox.Action.OK],
                        } );                       
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
                            actions: [MessageBox.Action.OK],
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
                                        success: function (oData) {
                                            let oBindingContext = oItem.getBindingContext();
                                            let sKeyValue = oBindingContext.getProperty("OrderID"); 
                                            let sReadUri = oModel.createKey("/Order_Details",
                                                        {
                                                            OrderID: sKeyValue
                                                        }
                                                    );
                                            oModel.remove(sReadUri, {  
                                                            success: function () {
                                                            MessageBox.show("Selected Order(s) deleted successfully.", 
                                                                {
                                                                    icon: MessageBox.Icon.INFORMATION,
                                                                    title: "Success",
                                                                    actions: [MessageBox.Action.OK], 
                                                                } );                                                                
                                                            },
                                                            error: function (oError){
                                                            MessageBox.show("Deletion Failed.", 
                                                                {
                                                                    icon: MessageBox.Icon.ERROR,
                                                                    title: "Error",
                                                                    actions: [MessageBox.Action.OK], 
                                                                } );   
                                                            }
                                                        });
                                        },
                                        error: function (oError){
                                            MessageBox.show("Deletion Failed.", 
                                                {
                                                    icon: MessageBox.Icon.ERROR,
                                                    title: "Error",
                                                    actions: [MessageBox.Action.OK], 
                                                } );   
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