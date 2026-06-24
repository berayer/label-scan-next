-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "table_header" TEXT,
    "creator" TEXT NOT NULL DEFAULT 'unknown',
    "create_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StockRow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stockId" INTEGER NOT NULL,
    "row_key" TEXT NOT NULL,
    "row_data" TEXT NOT NULL,
    "scan_state" BOOLEAN NOT NULL DEFAULT false,
    "scan_user" TEXT NOT NULL DEFAULT 'unknown',
    "scan_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockRow_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
