/*
    vlan migration
 */
#include "esp.h"

static int forward(Edi *db)
{
    EdiRec  *rec;
    int     rc, i;

    rc = 0;

    rc += ediAddTable(db, "vlan");
    rc += ediAddColumn(db, "vlan", "id", EDI_TYPE_INT, EDI_AUTO_INC | EDI_INDEX | EDI_KEY);
    rc += ediAddColumn(db, "vlan", "name", EDI_TYPE_STRING, 0);
    rc += ediAddColumn(db, "vlan", "description", EDI_TYPE_STRING, 0);
    rc += ediAddColumn(db, "vlan", "status", EDI_TYPE_STRING, 0);
    rc += ediAddColumn(db, "vlan", "mode", EDI_TYPE_STRING, 0);

    rc += ediAddColumn(db, "vlan", "rxBytes", EDI_TYPE_INT, 0);
    rc += ediAddColumn(db, "vlan", "rxPackets", EDI_TYPE_INT, 0);
    rc += ediAddColumn(db, "vlan", "txBytes", EDI_TYPE_INT, 0);
    rc += ediAddColumn(db, "vlan", "txPackets", EDI_TYPE_INT, 0);

    if (rc < 0) {
        return rc;
    }
    if ((rec = ediCreateRec(db, "vlan")) == 0) {
        return MPR_ERR_CANT_CREATE;
    }
    for (i = 0; i < 4; i++) {
        if (!ediSetField(rec, "name", sfmt("vlan%02d", i)) ||
                !ediSetField(rec, "description", sfmt("General VLAN-%d", i)) ||
                !ediSetField(rec, "mode", "Online") ||
                !ediSetField(rec, "status", "Normal") ||
                !ediSetField(rec, "rxBytes", "0") ||
                !ediSetField(rec, "rxPackets", "0") ||
                !ediSetField(rec, "txBytes", "0") ||
                !ediSetField(rec, "txPackets", "0")) {
            mprError("Can't update field for vlan table");
            rc = MPR_ERR_CANT_WRITE;
            break;
        }
        if (ediUpdateRec(db, rec) < 0) {
            mprError("Can't update record for vlan table");
            rc = MPR_ERR_CANT_WRITE;
            break;
        }
    }
    return rc;
}

static int backward(Edi *db)
{
    return ediRemoveTable(db, "vlan");
}

ESP_EXPORT int esp_migration_vlan(Edi *db)
{
    ediDefineMigration(db, forward, backward);
    return 0;
}

