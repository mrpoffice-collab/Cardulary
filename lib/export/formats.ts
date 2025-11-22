import * as XLSX from "xlsx";

export interface GuestExportData {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  status: string;
  submittedAt: Date | null;
}

/**
 * Export guests to CSV format
 */
export function exportToCSV(guests: GuestExportData[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State",
    "ZIP",
    "Country",
    "Status",
    "Submitted At",
  ];

  const rows = guests.map((guest) => [
    guest.firstName,
    guest.lastName,
    guest.email || "",
    guest.phone || "",
    guest.addressLine1 || "",
    guest.addressLine2 || "",
    guest.city || "",
    guest.state || "",
    guest.zip || "",
    guest.country || "",
    guest.status,
    guest.submittedAt ? new Date(guest.submittedAt).toLocaleDateString() : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Export guests to Excel format (.xlsx)
 */
export function exportToExcel(guests: GuestExportData[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(
    guests.map((guest) => ({
      "First Name": guest.firstName,
      "Last Name": guest.lastName,
      Email: guest.email || "",
      Phone: guest.phone || "",
      "Address Line 1": guest.addressLine1 || "",
      "Address Line 2": guest.addressLine2 || "",
      City: guest.city || "",
      State: guest.state || "",
      ZIP: guest.zip || "",
      Country: guest.country || "",
      Status: guest.status,
      "Submitted At": guest.submittedAt
        ? new Date(guest.submittedAt).toLocaleDateString()
        : "",
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Addresses");

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return excelBuffer;
}

/**
 * Export to Minted format
 * Minted uses a specific CSV format for address imports
 */
export function exportToMinted(guests: GuestExportData[]): string {
  const headers = [
    "First Name",
    "Last Name",
    "Street Address",
    "Street Address 2",
    "City",
    "State",
    "ZIP Code",
    "Country",
  ];

  const rows = guests
    .filter((g) => g.addressLine1) // Only include guests with addresses
    .map((guest) => [
      guest.firstName,
      guest.lastName,
      guest.addressLine1 || "",
      guest.addressLine2 || "",
      guest.city || "",
      guest.state || "",
      guest.zip || "",
      guest.country || "US",
    ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Export to Shutterfly format
 */
export function exportToShutterfly(guests: GuestExportData[]): string {
  const headers = [
    "FirstName",
    "LastName",
    "Address1",
    "Address2",
    "City",
    "State",
    "PostalCode",
    "Country",
  ];

  const rows = guests
    .filter((g) => g.addressLine1)
    .map((guest) => [
      guest.firstName,
      guest.lastName,
      guest.addressLine1 || "",
      guest.addressLine2 || "",
      guest.city || "",
      guest.state || "",
      guest.zip || "",
      guest.country || "US",
    ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Export to Vistaprint format
 */
export function exportToVistaprint(guests: GuestExportData[]): string {
  const headers = [
    "Recipient Name",
    "Company",
    "Address Line 1",
    "Address Line 2",
    "City",
    "State/Province",
    "Postal Code",
    "Country",
  ];

  const rows = guests
    .filter((g) => g.addressLine1)
    .map((guest) => [
      `${guest.firstName} ${guest.lastName}`,
      "", // Company
      guest.addressLine1 || "",
      guest.addressLine2 || "",
      guest.city || "",
      guest.state || "",
      guest.zip || "",
      guest.country || "US",
    ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Export for Avery labels (sorted by ZIP code for bulk mailing)
 */
export function exportForAveryLabels(guests: GuestExportData[]): string {
  const headers = [
    "Name",
    "Address Line 1",
    "Address Line 2",
    "City, State ZIP",
    "Country",
  ];

  // Sort by ZIP code for bulk mailing discounts
  const sortedGuests = [...guests]
    .filter((g) => g.addressLine1)
    .sort((a, b) => {
      const zipA = a.zip || "";
      const zipB = b.zip || "";
      return zipA.localeCompare(zipB);
    });

  const rows = sortedGuests.map((guest) => [
    `${guest.firstName} ${guest.lastName}`,
    guest.addressLine1 || "",
    guest.addressLine2 || "",
    `${guest.city || ""}, ${guest.state || ""} ${guest.zip || ""}`.trim(),
    guest.country || "US",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: string): string {
  switch (format) {
    case "excel":
      return "xlsx";
    case "csv":
    case "minted":
    case "shutterfly":
    case "vistaprint":
    case "avery":
      return "csv";
    default:
      return "csv";
  }
}

/**
 * Get filename for export
 */
export function getExportFilename(
  eventName: string,
  format: string
): string {
  const sanitizedName = eventName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const timestamp = new Date().toISOString().split("T")[0];
  const extension = getFileExtension(format);

  return `${sanitizedName}_addresses_${timestamp}.${extension}`;
}
