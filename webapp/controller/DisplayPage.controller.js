sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent'
], function (Controller, JSONModel, Component) {
        "use strict";

        return Controller.extend("casestudy.training.casestudyg3.controller.DisplayPage", {
            onInit: function() {  
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteDisplayPage").attachPatternMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function(oEvent) {
                var aArgs = oEvent.getParameter("arguments");
                MessageToast.show(aArgs.OrderID);
            },
        });
    });