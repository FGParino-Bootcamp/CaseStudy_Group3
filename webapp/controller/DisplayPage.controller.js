sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
], function (Controller, JSONModel, Component) {
        "use strict";

        return Controller.extend("casestudy.training.casestudyg3.controller.DisplayPage", {
            onInit: function() {  
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteDisplayPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function(oEvent) {
            var sOrderId = oEvent.getParameter("arguments").OrderID;
        
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

                var oTab = this.getView().byId("tabOrd");
                var oBinding = oTab.getBinding("items");
                var oFilter = new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.EQ, sOrderId);
                oBinding.filter([oFilter]); 

            },

            onEdit: function(){
                this.getOwnerComponent().getRouter().navTo("RouteEditPage"); 

            },

            onCancel: function () {
                this.getOwnerComponent().getRouter().navTo("RouteMainPage");
        }
        });
    });