import * as XLSX from "xlsx";

export const exportToExcel = (data, filename = "transactions") => {
    if(!data || data.length === 0) {
        alert("No data to export!");
        return;
    }
    try{

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        XLSX.writeFile(workbook, `${filename}.xlsx`,{
            bookType: "xlsx",
            type: "array",
        });

    } catch(err){
        alert("Error exporting to Excel!");
    }
}