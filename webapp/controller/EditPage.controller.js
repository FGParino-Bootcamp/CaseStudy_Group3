sap.ui.define([
  "sap/ui/core/mvc/Controller",
  'sap/ui/model/json/JSONModel',
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  '../model/formatter',
], function (Controller, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Formatter) {
  "use strict";
 
return Controller.extend("casestudy.training.casestudyg3.controller.EditPage", {
    formatter:Formatter,
    onInit: function () {
      this.getOwnerComponent().getRouter()
        .getRoute("RouteEditPage")
        .attachPatternMatched(this._onRouteMatched, this);
    },
 
    _onRouteMatched: function (oEvent) {
      var sOrderId = oEvent.getParameter("arguments").OrderID;
 
      const oModel = this.getView().getModel();
      var opanel1 = this.getView().byId("idPanelOrderHeaderEdit");
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
          error: function (data){

          }
      })            
      //const aOrders = oModel.getProperty("/Orders") || [];
      //const idx = aOrders.findIndex(o => String(o.OrderID) === String(this._sOrderId));
      //if (idx === -1) { MessageBox.error("Order not found"); return; }
      //this._sOrderPath = `/Orders/${idx}`;
      //this.getView().bindElement(this._sOrderPath);
 
     // const oTable = this.byId("ItemTable");
      //const oBinding = oTable.getBinding("items");
      //oBinding.filter([ new Filter("OrderID", FilterOperator.EQ, Number(this._sOrderId)) ]);
 
      //setTimeout(() => this._updateCounter(), 0);
 
      //this._snapshot = JSON.parse(JSON.stringify({
        //header: aOrders[idx],
        //details: this.getView().getModel("details").getProperty("/Order_Details")
                  //.filter(r => Number(r.OrderID) === Number(this._sOrderId))
      //}));
    },
 
    _updateCounter: function () {
      const b = this.byId("ItemTable").getBinding("items");
      const len = b && b.getLength ? b.getLength() : 0;
      this.byId("idTxtItemsCountEdit").setText(`Product (${len})`);
    },
 
    onQtyLiveChange: function (e) {
      const ctx = e.getSource().getBindingContext("details");
      const qty  = Number(e.getParameter("value"));
      const unit = Number(ctx.getProperty("UnitPrice"));
      if (!isNaN(qty) && !isNaN(unit)) {
        ctx.getModel().setProperty(ctx.getPath() + "/TotalPrice", qty * unit);
      }
    },
 
    onAddItem: function () {
      const vBox = new sap.m.VBox({
        items: [
          new sap.m.Label({ text: "Product Name" }),
          new sap.m.Input(this.createId("idProdName")),
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
          press: () => {
            const name = this.byId("idProdName").getValue().trim();
            const qty  = Number(this.byId("idQty").getValue());
            const unit = Number(this.byId("idUnit").getValue());
            if (!name || isNaN(qty) || qty <= 0 || isNaN(unit) || unit < 0) {
                MessageToast.show("Enter valid Product, Quantity and Unit Price"); return;
            }
            dlg.close();
            this._addDetailRow({ ProductName: name, Quantity: qty, UnitPrice: unit });
          }
        }),
        endButton: new sap.m.Button({ text: "Cancel", press: () => dlg.close() }),
        afterClose: () => dlg.destroy()
      });
      this.getView().addDependent(dlg);
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
      sap.m.MessageToast.show("Item added");
    },
 
    onDeleteItem: function () {
      const oTable = this.byId("ItemTable");
      const aSel = oTable.getSelectedItems();
    if (!aSel.length) { sap.m.MessageToast.show("Please select an item from the table"); return; }
 
      sap.m.MessageBox.confirm(`Are you sure you want to delete ${aSel.length} item(s)?`, {
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        onClose: (act) => {
          if (act !== sap.m.MessageBox.Action.OK) return;
 
          const oDetails = this.getView().getModel("details");
          let rows = oDetails.getProperty("/Order_Details");
          const idxs = aSel.map(li => li.getBindingContext("details").getPath())
                           .map(p => Number(p.split("/").pop()))
                           .sort((a,b) => b-a);
          idxs.forEach(i => rows.splice(i, 1));
          oDetails.setProperty("/Order_Details", rows);
          oTable.removeSelections(true);
          this._updateCounter();
          sap.m.MessageToast.show("Item(s) deleted");
        }
      });
    },
 
    onSave: function () {
      sap.m.MessageBox.confirm("Are you sure you want to Save these changes?", {
        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        onClose: (a) => {
          if (a !== sap.m.MessageBox.Action.YES) return;
          // JSONModel only (no persistence)
          sap.m.MessageBox.success(`The Order ${this._sOrderId} has been successfully updated.`, {
            onClose: () => this.getOwnerComponent().getRouter().navTo("RouteMainPage")
          });
        }
      });
    },
 
    onCancel: function () {
      sap.m.MessageBox.confirm("Are you sure you want to cancel the changes done into the page?", {
        actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
        onClose: (a) => {
          if (a !== sap.m.MessageBox.Action.YES) return;
          const oModel = this.getView().getModel();
          const oDetails = this.getView().getModel("details");
          if (this._snapshot) {
            oModel.setProperty(this._sOrderPath, this._snapshot.header);
            const all = oDetails.getProperty("/Order_Details")
              .filter(r => Number(r.OrderID) !== Number(this._sOrderId))
              .concat(this._snapshot.details);
            oDetails.setProperty("/Order_Details", all);
          }
 
          this.getOwnerComponent().getRouter().navTo("RouteMainPage");
        }
      });
    }
  });
});