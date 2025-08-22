sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/UIComponent',
    "../model/formatter"
], function (Controller, JSONModel, Filter, FilterOperator, Component, Formatter) {
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
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteCreatePage");            
            }
        });
    });