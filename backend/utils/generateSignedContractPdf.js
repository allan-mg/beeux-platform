const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const BRAND = {
  yellow: "#F9CB10",
  navy: "#1E2937",
  black: "#1D1D1B",
  gray: "#667085",
  lightGray: "#F4F6F8",
  border: "#E2E6EA",
  green: "#23683D",
  greenBackground: "#E3F7EA",
  white: "#FFFFFF",
};

const generateSignedContractPdf = (contract) =>
  new Promise((resolve, reject) => {
    try {
      const contractsDirectory = path.join(
        __dirname,
        "..",
        "generated",
        "contracts",
      );

      fs.mkdirSync(contractsDirectory, {
        recursive: true,
      });

      const fileName = `signed-contract-${contract._id}.pdf`;
      const filePath = path.join(contractsDirectory, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: 50,
          left: 50,
          right: 50,
          bottom: 10,
        },
        info: {
          Title: `Contrato firmado ${contract.serviceName}`,
          Author: "BeeUX",
          Subject: "Contrato de prestación de servicios firmado",
        },
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const snapshot = contract.contractSnapshot;
      const client = snapshot.client;
      const agency = snapshot.agency;
      const service = snapshot.service;
      const signature = contract.signature;

      const pageWidth = doc.page.width;
      const left = 50;
      const right = 50;
      const contentWidth = pageWidth - left - right;

      const sectionTitle = (number, title) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(BRAND.navy)
          .text(`${number}. ${title}`, left, doc.y);

        const lineY = doc.y + 3;

        doc
          .strokeColor(BRAND.yellow)
          .lineWidth(2)
          .moveTo(left, lineY)
          .lineTo(left + 42, lineY)
          .stroke();

        doc.moveDown(0.7);
      };

      const paragraph = (text) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor(BRAND.black)
          .text(text, left, doc.y, {
            width: contentWidth,
            lineGap: 2,
            align: "justify",
          });

        doc.moveDown(0.6);
      };

      const drawInfoBox = (rows) => {
        const boxX = left;
        const boxY = doc.y;
        const boxPadding = 14;
        const labelWidth = 110;
        const rowHeight = 18;

        const visibleRows = rows.filter((row) => row.value);

        const boxHeight = boxPadding * 2 + visibleRows.length * rowHeight;

        doc
          .roundedRect(boxX, boxY, contentWidth, boxHeight, 8)
          .fill(BRAND.lightGray);

        let rowY = boxY + boxPadding;

        visibleRows.forEach(({ label, value }) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(8)
            .fillColor(BRAND.gray)
            .text(label, boxX + boxPadding, rowY, {
              width: labelWidth,
              lineBreak: false,
            });

          doc
            .font("Helvetica")
            .fontSize(8.5)
            .fillColor(BRAND.black)
            .text(String(value), boxX + boxPadding + labelWidth, rowY, {
              width: contentWidth - boxPadding * 2 - labelWidth,
              lineBreak: false,
            });

          rowY += rowHeight;
        });

        doc.y = boxY + boxHeight + 16;
        doc.x = left;
      };

      /*
       * HEADER
       */

      doc.rect(0, 0, pageWidth, 95).fill(BRAND.navy);

      doc.rect(0, 91, pageWidth, 4).fill(BRAND.yellow);

      doc
        .font("Helvetica-Bold")
        .fontSize(23)
        .fillColor(BRAND.white)
        .text("BeeUX", left, 28);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#D7DCE2")
        .text("Digital Agency", left, 56);

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor(BRAND.white)
        .text("CONTRATO FIRMADO", 245, 31, {
          width: 300,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#D7DCE2")
        .text(`Versión ${contract.contractVersion || "1.0"}`, 245, 58, {
          width: 300,
          align: "right",
        });

      doc.y = 120;
      doc.x = left;

      /*
       * SIGNED STATUS
       */

      const statusY = doc.y;

      doc
        .roundedRect(left, statusY, contentWidth, 42, 8)
        .fill(BRAND.greenBackground);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(BRAND.green)
        .text("Contrato firmado electrónicamente", left + 14, statusY + 14, {
          lineBreak: false,
        });

      doc.y = statusY + 58;

      /*
       * INTRODUCTION
       */

      paragraph(
        `El presente contrato de prestación de servicios se celebra entre ${agency.legalName}, en adelante "EL PRESTADOR", y ${client.legalName}, en adelante "EL CLIENTE", conforme a las condiciones descritas en este documento.`,
      );

      /*
       * CLIENT
       */

      sectionTitle("1", "Datos del cliente");

      const fullAddress = [
        `${client.address.street || ""} ${
          client.address.exteriorNumber || ""
        }`.trim(),

        client.address.interiorNumber
          ? `Int. ${client.address.interiorNumber}`
          : "",

        client.address.neighborhood,
        client.address.city,
        client.address.state,
        client.address.postalCode,
        client.address.country,
      ]
        .filter(Boolean)
        .join(", ");

      drawInfoBox([
        {
          label: "Nombre legal",
          value: client.legalName,
        },
        {
          label: "Correo",
          value: client.email,
        },
        {
          label: "RFC / ID fiscal",
          value: client.taxId,
        },
        {
          label: "Teléfono",
          value: client.phone,
        },
        {
          label: "Domicilio",
          value: fullAddress,
        },
      ]);

      /*
       * SERVICE
       */

      sectionTitle("2", "Servicio contratado");

      drawInfoBox([
        {
          label: "Servicio",
          value: service.name,
        },
        {
          label: "Modalidad",
          value: service.billingType,
        },
        {
          label: "Precio",
          value: `$${service.amount} ${service.currency}`,
        },
      ]);

      /*
       * CLAUSES
       */

      sectionTitle("3", "Inversión publicitaria");

      paragraph(
        "La inversión destinada a plataformas publicitarias como Meta Ads, Facebook, Instagram, TikTok, Google Ads u otros medios no está incluida en el precio del servicio y deberá ser cubierta directamente por EL CLIENTE.",
      );

      sectionTitle("4", "Alcance del servicio");

      paragraph(
        `EL PRESTADOR realizará las actividades correspondientes al servicio ${service.name}, conforme al alcance, entregables, condiciones y especificaciones establecidas para dicho servicio.`,
      );

      sectionTitle("5", "Información y accesos");

      paragraph(
        "EL CLIENTE deberá proporcionar oportunamente la información, materiales, archivos, accesos y lineamientos necesarios para la correcta ejecución del servicio.",
      );

      /*
       * ELECTRONIC SIGNATURE
       */

      sectionTitle("6", "Evidencia de firma electrónica");

      const acceptedAt = signature.acceptedAt
        ? new Date(signature.acceptedAt).toLocaleString("es-MX")
        : "";

      drawInfoBox([
        {
          label: "Firmante",
          value: signature.signerName,
        },
        {
          label: "Correo",
          value: signature.signerEmail,
        },
        {
          label: "Método",
          value: "Aceptación electrónica",
        },
        {
          label: "Versión",
          value: signature.contractVersion,
        },
        {
          label: "Fecha y hora",
          value: acceptedAt,
        },
        {
          label: "IP registrada",
          value: signature.ipAddress,
        },
      ]);

      /*
       * FOOTER
       */

      const footerY = 805;

      doc
        .strokeColor(BRAND.yellow)
        .lineWidth(1)
        .moveTo(left, footerY - 6)
        .lineTo(pageWidth - right, footerY - 6)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(6)
        .fillColor(BRAND.gray)
        .text(`${agency.website} | ${agency.email}`, left, footerY, {
          width: 230,
          lineBreak: false,
        });

      doc.text(
        `Firmado ${new Date(contract.signedAt || Date.now()).toLocaleDateString(
          "es-MX",
        )}`,
        365,
        footerY,
        {
          width: 180,
          align: "right",
          lineBreak: false,
        },
      );

      doc
        .fontSize(5)
        .fillColor("#8A919C")
        .text(
          "Documento generado por BeeUX. Plantilla de desarrollo pendiente de revisión legal.",
          left,
          footerY + 11,
          {
            width: contentWidth,
            align: "center",
            lineBreak: false,
          },
        );

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });

module.exports = generateSignedContractPdf;
