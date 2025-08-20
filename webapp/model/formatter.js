    sap.ui.define([], function() {
        "use strict";
        return {
            formatDate: function(sDate) {
                if (sDate) {
                    var iTimestamp = parseInt(sDate.replace("/Date(", "").replace(")/", ""));
                    var oDate = new Date(iTimestamp);
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd MMM YYYY" }); 
                    return oDateFormat.format(oDate);
                }
            }
        };
    });