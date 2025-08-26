sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
  "use strict";
 
return Controller.extend("casestudy.training.casestudyg3.controller.EditPage", {
    onInit: function () {
      this._sOrderId = null;
      this._oAddDialog = null;
      this.getOwnerComponent()
        .getRouter()
        .getRoute("RouteEditPage")
        .attachPatternMatched(this._onRouteMatched, this);
    },
 
    _onRouteMatched: function (oEvent) {
      var sOrderId = oEvent.getParameter("arguments").OrderID;
      this._sOrderId = sOrderId;
 
      const oModel = this.getView().getModel();
      var oPanelHeader = this.getView().byId("idPanelOrderHeaderEdit");
      var sReadUri = oModel.createKey("/Orders", { OrderID: sOrderId });
 
      oModel.read(sReadUri, {
        success: function (oData) {
          if (oData) {
            var oOrderModel = new JSONModel(oData);
            oPanelHeader.setModel(oOrderModel, "OrderData");
          }
 
      oModel.read("/Order_Details", {
            filters: [ new Filter("OrderID", FilterOperator.EQ, sOrderId) ],
            success: function (oDetailData) {
              var oDetailsModel = new JSONModel({
                Order_Details: (oDetailData && oDetailData.results) ? oDetailData.results : []
              });
              this.getView().setModel(oDetailsModel, "details");
              this._updateCounter();
            }.bind(this),
            error: function (oError) {
              console.error("Error reading data:", oError);
              MessageBox.error("Error reading Order_Details.");
              this.getView().setModel(new JSONModel({ Order_Details: [] }), "details");
              this._updateCounter();
            }.bind(this)
          });
        }.bind(this),
        error: function (oError) {
          console.error("Error reading data:", oError);
          MessageBox.error("Error reading Orders.");
        }
      });
    },
 
    _updateCounter: function () {
      var oDetails = this.getView().getModel("details");
      var a = oDetails ? (oDetails.getProperty("/Order_Details") || []) : [];
      var oTxt = this.byId("idTxtItemsCountEdit");
      if (oTxt) { oTxt.setText("Product (" + a.length + ")"); }
    },
 
    onAddItem: function () {
      if (this._oAddDialog) {
        this._oAddDialog.open();
        return;
      }
 
      var vBox = new sap.m.VBox({
        items: [
          new sap.m.Label({ text: "Product Name" }),
          new sap.m.Input(this.createId("idProdName"), { value: "" }),
          new sap.m.Label({ text: "Quantity" }),
          new sap.m.Input(this.createId("idQty"), { type: "Number", value: "1" }),
          new sap.m.Label({ text: "Unit Price" }),
          new sap.m.Input(this.createId("idUnit"), { type: "Number", value: "0" })
        ]
      }).addStyleClass("sapUiSmallMargin");
 
      const dlg = new sap.m.Dialog({
        title: "Add Product",
        contentWidth: "22rem",
        content: [ vBox ],
        beginButton: new sap.m.Button({
          text: "Add",
          press: function () {
            const name = this.byId("idProdName").getValue().trim();
            const qty  = Number(this.byId("idQty").getValue());
            const unit = Number(this.byId("idUnit").getValue());
 
            if (!name || isNaN(qty) || qty <= 0 || isNaN(unit) || unit < 0) {
              MessageBox.error("Enter valid Product, Quantity and Unit Price");
              return;
            }
 
            dlg.close();
            this._addDetailRow({ ProductName: name, Quantity: qty, UnitPrice: unit });
            MessageToast.show("Item added");
          }.bind(this)
        }),
        endButton: new sap.m.Button({ text: "Cancel", press: () => dlg.close() }),
        afterClose: () => { dlg.destroy(); this._oAddDialog = null; }
      });
 
      this.getView().addDependent(dlg);
      this._oAddDialog = dlg;
      dlg.open();
    },
 
    _addDetailRow: function ({ ProductName, Quantity, UnitPrice }) {
      const oDetails = this.getView().getModel("details");
      const a = oDetails.getProperty("/Order_Details");
      a.push({
        OrderID: Number(this._sOrderId),
        ProductName,
        Quantity,
        UnitPrice,
        TotalPrice: Quantity * UnitPrice
      });
      oDetails.setProperty("/Order_Details", a);
      this._updateCounter();
    },
 
    onDeleteItem: function () {
      const oTable = this.byId("ItemTable"); // adjust if your table id is different
      const aSel = oTable.getSelectedItems();
      if (!aSel.length) {
      MessageToast.show("Please select an item from the table");
        return;
      }
 
      MessageBox.confirm(`Are you sure you want to delete ${aSel.length} item(s)?`, {
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        onClose: (act) => {
          if (act !== MessageBox.Action.OK) return;
 
          const oDetails = this.getView().getModel("details");
          let rows = oDetails.getProperty("/Order_Details");
          const idxs = aSel.map(li => li.getBindingContext("details").getPath())
            .map(p => Number(p.split("/").pop()))
            .sort((a, b) => b - a);
 
          idxs.forEach(i => rows.splice(i, 1));
          oDetails.setProperty("/Order_Details", rows);
          oTable.removeSelections(true);
          this._updateCounter();
          MessageToast.show("Item(s) deleted");
        }
      });
    },
 
    onSave: function () {
      MessageBox.confirm("Are you sure you want to Save these changes?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: (a) => {
          if (a !== MessageBox.Action.YES) return;
 
          const oDetails = this.getView().getModel("details");
          const aAll = oDetails.getProperty("/Order_Details");
          aAll.forEach(r => r.TotalPrice = (Number(r.Quantity) || 0) * (Number(r.UnitPrice) || 0));
          oDetails.setProperty("/Order_Details", aAll);
 
          MessageBox.success(`The Order ${this._sOrderId} has been successfully updated.`, {
            onClose: () => this.getOwnerComponent().getRouter().navTo("RouteMainPage")
          });
        }
      });
    },
 
    onCancel: function () {
      MessageBox.confirm("Are you sure you want to cancel the changes done into the page?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: (a) => {
          if (a !== MessageBox.Action.YES) return;
 
          const oModel = this.getView().getModel();
          const oDetails = this.getView().getModel("details");
 
        if (this._snapshot) {
            oModel.setProperty(this._sOrderPath, this._snapshot.header);
            var all = oDetails.getProperty("/Order_Details") || [];
            all = all.filter(r => Number(r.OrderID) !== Number(this._sOrderId))
                     .concat(this._snapshot.details);
            oDetails.setProperty("/Order_Details", all);
          }
 
          this.getOwnerComponent().getRouter().navTo("RouteMainPage");
        }
      });
    }
  });
});