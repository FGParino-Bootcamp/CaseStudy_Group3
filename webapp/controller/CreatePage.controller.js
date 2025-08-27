sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/UIComponent',
    "sap/ui/model/Sorter",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "casestudy/training/casestudyg3/model/formatter",
     'sap/ui/core/format/DateFormat'
], function (Controller, JSONModel, Component, Sorter, ValueHelpDialog, formatter, DateFormat) {
        "use strict";

        var OrderID;
        return Controller.extend("casestudy.training.casestudyg3.controller.CreatePage", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteCreatePage").attachMatched(this._onObjectMatched, this);

                var oValueHelpModel = new JSONModel([
                    { "Plant": "9101", "Name": "Singapore" },
                    { "Plant": "9102", "Name": "Malaysia" },
                    { "Plant": "9103", "Name": "Vietnam" },
                    { "Plant": "9104", "Name": "Thailand" },
                    { "Plant": "9105", "Name": "Philippines" },
                ]);
                this.getView().setModel(oValueHelpModel, "vhDataModel");
                var oModel = this.getOwnerComponent().getModel("DetailModel");
                oModel.setProperty("/Orders_Details", []);
            },

            onSelectReceivingPlant: function (oEvent) {
                var oInput = oEvent.getSource();
                var oValueHelpDialog = new ValueHelpDialog({
                    title: "Select Receiving Plant",
                    supportRanges: false,
                    supportMultiselect: false,
                    key: "Plant",
                    descriptionKey: "Name",
                    stretch: sap.ui.Device.system.phone,
                    ok: function (oControlEvent) {
                        var aTokens = oControlEvent.getParameter("tokens");
                        if (aTokens && aTokens.length > 0) {
                            var oSelectedToken = aTokens[0];
                            var tokenKey = oSelectedToken.getKey();
                            var tokenText = oSelectedToken.getText();
                            const aParts = tokenText.split("(");
                            const sText = aParts[0];
                            var keyText = tokenKey + "-" + sText;
                            oInput.setValue(keyText);
                            
                            this.recPlant = tokenKey;
                            this.recPlantDesc = sText;
                        }
                        oValueHelpDialog.close();
                    }.bind(this),
                    cancel: function () {
                        oValueHelpDialog.close();
                    },
                    afterClose: function () {
                        oValueHelpDialog.destroy();
                    }
                });
                // Set the model to the value help dialog
                oValueHelpDialog.setModel(this.getView().getModel("vhDataModel"));
                // Define columns for the table within the value help dialog
                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getView().getModel("vhDataModel")); // Set model to table
                    oTable.bindRows("/").setSelectionMode(sap.ui.table.SelectionMode.Single);
                    oTable.addColumn(new sap.ui.table.Column({
                        label: "Plant",
                        template: new sap.m.Text({ text: "{Plant}" })
                    }));
                    oTable.addColumn(new sap.ui.table.Column({
                        label: "Name",
                        template: new sap.m.Text({ text: "{Name}" })
                    }));
                }.bind(this));
                oValueHelpDialog.open();               
            },

            onSelectDeliveryPlant: function (oEvent) {
                var oInput = oEvent.getSource();
                var oValueHelpDialog = new ValueHelpDialog({
                    title: "Select Delivery Plant",                   
                    supportRanges: false,
                    supportMultiselect: false,
                    key: "Plant",
                    descriptionKey: "Name",
                    stretch: sap.ui.Device.system.phone,
                    ok: function (oControlEvent) {
                        var aTokens = oControlEvent.getParameter("tokens");
                        if (aTokens && aTokens.length > 0) {
                            var oSelectedToken = aTokens[0];
                            var tokenKey = oSelectedToken.getKey();
                            var tokenText = oSelectedToken.getText();
                            const aParts = tokenText.split("(");
                            const sText = aParts[0];
                            var keyText = tokenKey + "-" + sText;
                            oInput.setValue(keyText); 
                            
                            this.delPlant = tokenKey;
                            this.delPlantDesc = sText;
                        }
                        oValueHelpDialog.close();
                    }.bind(this),
                    cancel: function () {
                        oValueHelpDialog.close();
                    },
                    afterClose: function () {
                        oValueHelpDialog.destroy();
                    }
                });
                // Set the model to the value help dialog
                oValueHelpDialog.setModel(this.getView().getModel("vhDataModel"));
                // Define columns for the table within the value help dialog
                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    oTable.setModel(this.getView().getModel("vhDataModel")); // Set model to table
                    oTable.bindRows("/").setSelectionMode(sap.ui.table.SelectionMode.Single);
                    oTable.addColumn(new sap.ui.table.Column({
                        label: "Plant",
                        template: new sap.m.Text({ text: "{Plant}" })
                    }));
                    oTable.addColumn(new sap.ui.table.Column({
                        label: "Name",
                        template: new sap.m.Text({ text: "{Name}" })
                    }));
                }.bind(this));
                oValueHelpDialog.open();               
            },

            _updateCount: function () {
                const getItems = this.byId("TblItem").getBinding("items");
                const len = getItems && getItems.getLength ? getItems.getLength() : 0;
                this.byId("idProdItemsCount").setText(`Product (${len})`);
            },
        
            onQtyManualChg: function (a) {
                const bindCtx = a.getSource().getBindingContext("DetailModel");
                const qtyValue  = Number(a.getParameter("value"));
                const UnitPrice = Number(bindCtx.getProperty("UnitPrice"));
                if (!isNaN(qtyValue) && !isNaN(UnitPrice)) {
                    bindCtx.getModel().setProperty(bindCtx.getPath() + "/TotalPrice", qtyValue * UnitPrice);
                }
            },
        
            onAddProduct: function (oEvent) {
                const vBox = new sap.m.VBox({
                    items: [
                        new sap.m.Label({ text: "Product Name" }),
                        new sap.m.Input(this.createId("proditem")),
                        new sap.m.Label({ text: "Quantity" }),
                        new sap.m.Input(this.createId("quanid"), { type: "Number", value: "1" }),
                        new sap.m.Label({ text: "Unit Price" }),
                        new sap.m.Input(this.createId("unpriceid"), { type: "Number", value: "0" })
                    ]
                }).addStyleClass("sapUiSmallMargin");
            
                const newDlg = new sap.m.Dialog({
                    title: "Add Product Details",
                    contentWidth: "22rem",
                    content: [ vBox ],
                    beginButton: new sap.m.Button({
                    text: "Add",
                    press: () => {
                        const ProdName = this.byId("proditem").getValue().trim();
                        const Qty  = Number(this.byId("quanid").getValue());
                        const Price = Number(this.byId("unpriceid").getValue());
                        if (!ProdName || isNaN(Qty) || Qty <= 0 || isNaN(Price) || Price < 0) {
                            MessageToast.show("Enter valid Product, Quantity and Unit Price"); return;
                        }
                        newDlg.close();
                        this._addItem({ ProductName: ProdName, Quantity: Qty, UnitPrice: Price });
                    }
                    }),
                    endButton: new sap.m.Button({ text: "Cancel", press: () => newDlg.close() }),
                    afterClose: () => newDlg.destroy()
                });
                this.getView().addDependent(newDlg);
                newDlg.open();
            },
        
            _addItem: function ({ ProductName, Quantity, UnitPrice }) {
                const oDetails = this.getView().getModel("DetailModel");
                const propDetails = oDetails.getProperty("/Order_Details");
                propDetails.push({
                    ProductName,
                    Quantity,
                    UnitPrice,
                    TotalPrice: Quantity * UnitPrice
                });
                oDetails.setProperty("/Order_Details", propDetails);
                this._updateCount();
                sap.m.MessageToast.show("Item added");
            },

            onDeleteProduct: function () {
                const oDelTable = this.byId("TblItem");
                const aSelItms = oDelTable.getSelectedItems();
                if (!aSelItms.length) { 
                    sap.m.MessageToast.show("Select an item"); 
                    return; }
            
                sap.m.MessageBox.confirm(`Delete ${aSelItms.length} item(s)?`, {
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    onClose: (act) => {
                        if (act !== sap.m.MessageBox.Action.OK) 
                            return;                
                        const oDetails = this.getView().getModel("details");
                        let rows = oDetails.getProperty("/Order_Details");
                        const rowCount= aSelItms.map(li => li.getBindingContext("details").getPath())
                                        .map(pop => Number(pop.split("/").pop()))
                                        .sort((a,b) => b-a);
                        rowCount.forEach(i => rows.splice(i, 1));
                        oDetails.setProperty("/Order_Details", rows);
                        oDelTable.removeSelections(true);
                        this._updateCount();
                        sap.m.MessageToast.show("Item/s deleted");
                    }
                });
            },

            fnCreateKey: function () {
                var oModel = this.getView().byId("TblItem").getModel();
                    oModel.read("/Orders_Details", {
                        sorters: [new sap.ui.model.Sorter("OrderID", true)],
                        urlParameters: { "$top": 1, "$select": "OrderID" },
                        success: function (oData) {
                            var orderIDMax = 1;
                            if (oData.results && oData.results.length > 0) {
                                orderIDMax = parseInt(oData.results[0].OrderID, 10) + 1; // increment for new OrderID
                                return OrderID = orderIDMax;
                            }
                        },
                        error: function (oError) {
                            console.error("Error reading OrderID:", oError);
                        }
                    });
            },
            
            onSave: function () {
                var oDModel = this.getOwnerComponent().getModel("DetailModel");
                var oModel = this.getView().getModel();
                var recPlant1 = this.recPlant;
                var delPlant1 = this.delPlant;
                var recPlantDesc = this.recPlantDesc;
                var delPlantDesc = this.delPlantDesc;
                var oToday = new Date();
                var oDateFormat = DateFormat.getDateInstance({pattern: "yyyyMMdd"});
                var sFormattedDate = oDateFormat.format(oToday);
                sap.m.MessageBox.confirm("Save changes?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: (a) => {
                    if (a == sap.m.MessageBox.Action.YES)  
                        //var Products = this.getProducts(); 
                        //var creationDate = this.formatter.formatDate(oToday);

                            var sOrderID = this.fnCreateKey();
                            var oData = {
                                OrderID: sOrderID,
                                CreationDate: oToday,
                                ReceivingPlant: recPlant1,
                                RPlantDesc: recPlantDesc,
                                DeliveringPlant: delPlant1,
                                DPlantDesc: delPlantDesc,
                                Status: "Created",
                                ConvertedDate: sFormattedDate
                            };
                            oModel.create("/Orders", oData, {
                                success: function(data){
                                var oDataDetail = oDModel.getProperty("/Order_Details");
                                for (var i = 0; i < oDataDetail.length; i++) {
                                    var oDataDetail = {
                                        OrderID: sOrderID,
                                        ProductName: oDataDetail[i].ProductName,
                                        "Quantity":  oDataDetail[i].Quantity,
                                        "UnitPrice": oDataDetail[i].UnitPrice,
                                        "TotalPrice": oDataDetail[i].TotalPrice }; 
                                            oModel.create("/Order_Details", oDataDetail, {
                                                success: function (oProductData) {
                                                    sap.m.MessageBox.success("Order was successfully added.", {
                                                        onClose: () => this.getOwnerComponent().getRouter().navTo("RouteMainPage")
                                                    });
                                                },
                                                error: function (oError) {
                                                    sap.m.MessageBox.error("Failed to create product item.");
                                                }
                                        });    
                                        }                                          
                               },
                            });
                    }
                });
            },
            
            onCancel: function () {
                sap.m.MessageBox.confirm("Cancel changes done in the page?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: (a) => {
                    if (a !== sap.m.MessageBox.Action.YES) 
                        return;
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
             },           
        });
    });

    