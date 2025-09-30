import * as XLSX from "xlsx";

export interface CleanedExcelData {
  [key: string]: string | number | null;
}

export interface ExcelProcessingResult {
  data: CleanedExcelData[];
  errors: string[];
  totalRows: number;
  processedRows: number;
}

export const cleanString = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  return stringValue.trim().replace(/\s+/g, " ");
};

export const normalizePhoneNumber = (
  phoneNumber: string | number | null | undefined
): string => {
  if (phoneNumber === null || phoneNumber === undefined) {
    return "";
  }

  let phone = String(phoneNumber).trim();

  phone = phone.replace(/[^\d]/g, "");

  return phone;
};

export const normalizeNameWithSpaces = (name: string): string => {
  if (name.includes(" ")) {
    return name;
  }

  const separateCapitalizedWords = (text: string): string => {
    return text.replace(/([a-z])([A-Z])/g, "$1 $2");
  };

  const specialCases: { [key: string]: string } = {
    petrushandika: "Petrus Handika",
    johndoe: "John Doe",
  };

  const lowerName = name.toLowerCase();
  if (specialCases[lowerName]) {
    return specialCases[lowerName];
  }

  const separated = separateCapitalizedWords(name);

  return separated.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const cleanExcelData = (
  data: Record<string, string | number | null>[]
): CleanedExcelData[] => {
  return data.map((row) => {
    const cleanedRow: CleanedExcelData = {};

    Object.keys(row).forEach((key) => {
      const cleanedKey = cleanString(key);
      const value = row[key];

      if (typeof value === "string") {
        cleanedRow[cleanedKey] = cleanString(value);
      } else if (typeof value === "number") {
        cleanedRow[cleanedKey] = value;
      } else {
        cleanedRow[cleanedKey] =
          value === null || value === undefined ? null : cleanString(value);
      }
    });

    return cleanedRow;
  });
};

const EXPECTED_HEADERS = {
  no: ["no", "number", "nomor", "num"],
  invoice: ["invoice", "inv", "no_invoice"],
  nama: ["nama", "name", "full_name", "fullname", "participant_name"],
  email: ["email", "e-mail", "mail", "email_address"],
  no_telp: [
    "no_telp",
    "phone number",
    "phone_number",
    "telp",
    "tlp",
    "phone",
    "no_hp",
    "telephone",
    "mobile",
  ],
  attendance: ["attendance", "status", "kehadiran", "hadir"],
};

const mapHeaderToStandard = (header: string): string | null => {
  const cleanHeader = cleanString(header).toLowerCase();

  for (const [standardKey, variations] of Object.entries(EXPECTED_HEADERS)) {
    if (variations.includes(cleanHeader)) {
      return standardKey;
    }
  }

  return null;
};

export const processExcelFile = async (
  file: File
): Promise<ExcelProcessingResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: false,
        });

        if (jsonData.length === 0) {
          resolve({
            data: [],
            errors: ["File Excel kosong"],
            totalRows: 0,
            processedRows: 0,
          });
          return;
        }

        const headers = jsonData[0] as string[];
        const errors: string[] = [];

        const headerMapping: { [key: string]: number } = {};
        const unmappedHeaders: string[] = [];

        headers.forEach((header, index) => {
          const standardHeader = mapHeaderToStandard(header);
          if (standardHeader) {
            headerMapping[standardHeader] = index;
          } else {
            unmappedHeaders.push(header);
          }
        });

        if (!headerMapping.nama) {
          errors.push(
            "Kolom 'Nama' tidak ditemukan. Pastikan file Excel memiliki kolom nama peserta."
          );
        }

        if (unmappedHeaders.length > 0) {
          errors.push(`Header tidak dikenali: ${unmappedHeaders.join(", ")}`);
        }

        const dataRows = jsonData.slice(1) as (string | number | null)[][];
        const processedData: CleanedExcelData[] = [];

        dataRows.forEach((row, index) => {
          try {
            const rowData: CleanedExcelData = {};

            Object.entries(headerMapping).forEach(([standardKey, colIndex]) => {
              const cellValue = row[colIndex];

              if (standardKey === "no_telp") {
                rowData[standardKey] = normalizePhoneNumber(cellValue);
              } else if (standardKey === "nama") {
                if (typeof cellValue === "string") {
                  const cleanedName = cleanString(cellValue);
                  rowData[standardKey] = normalizeNameWithSpaces(cleanedName);
                } else if (cellValue !== null && cellValue !== undefined) {
                  const cleanedName = cleanString(String(cellValue));
                  rowData[standardKey] = normalizeNameWithSpaces(cleanedName);
                } else {
                  rowData[standardKey] = null;
                }
              } else if (typeof cellValue === "string") {
                rowData[standardKey] = cleanString(cellValue);
              } else if (typeof cellValue === "number") {
                if (standardKey === "no_telp") {
                  rowData[standardKey] = normalizePhoneNumber(cellValue);
                } else {
                  rowData[standardKey] = cellValue;
                }
              } else {
                rowData[standardKey] =
                  cellValue === null || cellValue === undefined
                    ? null
                    : standardKey === "no_telp"
                    ? normalizePhoneNumber(cellValue)
                    : cleanString(String(cellValue));
              }
            });

            const namaValue = rowData.nama;
            if (!namaValue || String(namaValue).trim() === "") {
              errors.push(`Baris ${index + 2}: Nama tidak boleh kosong`);
              return;
            }

            const hasData = Object.values(rowData).some(
              (value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            );

            if (hasData) {
              processedData.push(rowData);
            }
          } catch (error) {
            errors.push(`Error processing row ${index + 2}: ${error}`);
          }
        });

        resolve({
          data: processedData,
          errors,
          totalRows: dataRows.length,
          processedRows: processedData.length,
        });
      } catch (error) {
        reject(new Error(`Error reading Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const createCleanedExcelFile = (
  data: CleanedExcelData[],
  filename: string
): File => {
  const formattedData = data.map((row, index) => {
    return {
      no: index + 1,
      invoice: row.invoice || "",
      nama: row.nama || "",
      email: row.email || "",
      no_telp: row.no_telp || "",
      attendance: row.attendance || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return new File([blob], filename, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
