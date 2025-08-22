    sap.ui.define([
        "sap/ui/core/format/DateFormat"
    ], function(DateFormat) {
        "use strict";
        return {
            formatDate: function(sDate) {
                if (sDate) {
                    var oDateFormat = DateFormat.getInstance({ pattern: "dd MMM YYYY" });
                    return oDateFormat.format(sDate);
                }
            },
            statusState: function(sValue) {
                if (sValue === "Released") {
                    return "Warning";
                }
                if (sValue === "Partially Completed") {
                    return "Information";
                }
                if (sValue === "Delivered") {
                    return "Success";
                }
            }
        };
    });