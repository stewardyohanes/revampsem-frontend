import React from "react";
import { Button } from "../../../components/ui/button.tsx";
import { Download } from "lucide-react";

interface ExportData {
  [key: string]: string | number | boolean | Date;
}

interface ExcelExportProps {
  data: ExportData[];
  filename?: string;
  text?: string;
  customHeaders?: { [key: string]: string };
  disabled?: boolean;
  onClick?: () => void;
}

const ExcelExportCSV: React.FC<ExcelExportProps> = ({
  data,
  filename = "export.csv",
  text = "Export CSV",
  customHeaders,
  disabled = false,
  onClick,
}) => {
  const downloadCSV = () => {
    let headers: string[];

    if (customHeaders && data.length > 0) {
      headers = Object.keys(customHeaders);
    } else if (data.length > 0) {
      headers = Object.keys(data[0]);
    } else {
      return;
    }

    const headerLabels = customHeaders
      ? headers.map((key) => customHeaders[key] || key)
      : headers;

    const csvContent = [
      headerLabels.join(";"),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value instanceof Date) {
              return value.toISOString();
            }
            if (typeof value === "string" && (value.includes(";") || value.includes(","))) {
              return `"${value}"`;
            }
            return value;
          })
          .join(";")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = window.URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClick = () => {
    if (disabled && onClick) {
      onClick();
      return;
    }
    if (!disabled) {
      downloadCSV();
    }
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={disabled}>
      <Download className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );
};

export default ExcelExportCSV;
