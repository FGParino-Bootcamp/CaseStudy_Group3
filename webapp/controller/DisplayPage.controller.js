sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    '../model/formatter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function (Controller, JSONModel, Component, Formatter, Filter, FilterOperator) {
        "use strict";
        var orderID;
        return Controller.extend("casestudy.training.casestudyg3.controller.DisplayPage", {
            formatter:Formatter,

            onInit: function() {  
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteDisplayPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function(oEvent) {
            var sOrderId = oEvent.getParameter("arguments").OrderID;
            orderID = sOrderId;
            var oModel = this.getView().getModel();
            var opanel1 = this.getView().byId("idDisplayViewPanelOrderDetail");
            var sReadUri = oModel.createKey("/Orders",
                        {
                            OrderID: sOrderId
                        }
                    );
            oModel.read(sReadUri,{
                success: function (oData) {
                    if (oData) {
                    
                        var oOrderModel = new JSONModel(oData);
                        opanel1.setModel(oOrderModel, "OrderData");
                    }
                },
                error: function (oError){
                    console.error("Error reading data:", oError);
                }
            })
            var aFilters = [];
            aFilters.push(new Filter("OrderID", FilterOperator.EQ, sOrderId));
            var oTab = this.getView().byId("tabOrd");
            var oBinding = oTab.getBinding("items");
            oBinding.filter(aFilters); 
            },

            onEdit: function(){
                //Navigate to Display Page
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteEditPage", { OrderID: orderID });

            },

            onCancel: function () {
                this.getOwnerComponent().getRouter().navTo("RouteMainPage");
        }
        });
    });