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
  white: "#FFFFFF",
};

const generateContractPdf = (contract) =>
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

      const fileName = `contract-${contract._id}.pdf`;
      const filePath = path.join(contractsDirectory, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Contrato ${contract.serviceName}`,
          Author: "BeeUX",
          Subject: "Contrato de prestación de servicios",
        },
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const snapshot = contract.contractSnapshot;

      const client = snapshot.client;
      const agency = snapshot.agency;
      const service = snapshot.service;

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
        const labelWidth = 105;
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
        .text("CONTRATO DE PRESTACIÓN DE SERVICIOS", 245, 31, {
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
       * INTRODUCTION
       */

      paragraph(
        `El presente contrato de prestación de servicios se celebra entre ${agency.legalName}, en adelante "EL PRESTADOR", y ${client.legalName}, en adelante "EL CLIENTE", conforme a las condiciones descritas en este documento.`,
      );

      /*
       * CLIENT DATA
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
          label: "Representante",
          value: client.representativeName,
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

      sectionTitle("6", "Inicio del servicio");

      paragraph(
        "El servicio podrá iniciar una vez confirmado el pago, firmado el contrato y completado el brief correspondiente.",
      );

      /*
       * SIGNATURES
       */

      const separatorY = doc.y + 5;

      doc
        .strokeColor(BRAND.border)
        .lineWidth(1)
        .moveTo(left, separatorY)
        .lineTo(pageWidth - right, separatorY)
        .stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(BRAND.navy)
        .text("Firmas", left, separatorY + 15, {
          lineBreak: false,
        });

      const signatureY = separatorY + 82;

      const clientX = 70;
      const agencyX = 335;
      const signatureWidth = 190;

      doc
        .strokeColor(BRAND.gray)
        .lineWidth(0.7)
        .moveTo(clientX, signatureY)
        .lineTo(clientX + signatureWidth, signatureY)
        .stroke();

      doc
        .moveTo(agencyX, signatureY)
        .lineTo(agencyX + signatureWidth, signatureY)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(BRAND.gray)
        .text(client.legalName, clientX, signatureY + 7, {
          width: signatureWidth,
          align: "center",
          lineBreak: false,
        });

      doc.text(agency.legalName, agencyX, signatureY + 7, {
        width: signatureWidth,
        align: "center",
        lineBreak: false,
      });

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor(BRAND.gray)
        .text("EL CLIENTE", clientX, signatureY + 22, {
          width: signatureWidth,
          align: "center",
          lineBreak: false,
        });

      doc.text("EL PRESTADOR", agencyX, signatureY + 22, {
        width: signatureWidth,
        align: "center",
        lineBreak: false,
      });

      /*
       * FOOTER
       *
       * Important:
       * Keep the footer inside the printable area.
       */

      const footerY = 755;

      doc
        .strokeColor(BRAND.yellow)
        .lineWidth(1)
        .moveTo(left, footerY)
        .lineTo(pageWidth - right, footerY)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(BRAND.gray)
        .text(`${agency.website} | ${agency.email}`, left, footerY + 9, {
          width: 280,
          lineBreak: false,
        });

      doc.text(
        `Generado ${new Date(
          contract.generatedAt || Date.now(),
        ).toLocaleDateString("es-MX")}`,
        330,
        footerY + 9,
        {
          width: 215,
          align: "right",
          lineBreak: false,
        },
      );

      doc
        .fontSize(6)
        .fillColor("#8A919C")
        .text(
          "Documento generado automáticamente por BeeUX. Plantilla en desarrollo pendiente de revisión legal antes de su uso definitivo.",
          left,
          footerY + 24,
          {
            width: contentWidth,
            align: "center",
            lineBreak: false,
          },
        );

      /*
       * FINISH PDF
       */

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

module.exports = generateContractPdf;
