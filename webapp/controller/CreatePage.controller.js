sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    "sap/ui/model/Sorter",
], function (Controller, JSONModel, Component, Sorter) {
        "use strict";

        return Controller.extend("casestudy.training.casestudyg3.controller.CreatePage", {
            onInit: function() {  
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteCreatePage").attachMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function(oEvent) {
            },
            fnCreateKey: function () {
                oModel.read("/Orders", {
                    sorters: [ new Sorter("OrderID", true) ],
                    urlParameters: { "$top": 1, "$select": "OrderID" },
                    success: function(oData) {
                        if (oData.results && oData.results.length > 0) {
                            var orderIDMax = oData.results[0].OrderID;
                        } else {
                             orderIDMax = 1;
                        }
                    },
                    error: function(oError) {
                        console.error("Error reading data:", oError);
                    }
                });                
            }
        });
    });