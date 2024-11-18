// Initialize QRCodeStyling for Text/URL QR codes
let qrCode = new QRCodeStyling({
  width: 225, 
  height: 225, 
  data: "",
  image: "",
  dotsOptions: {
    type: "square",
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 15 
  }
});

// Render QR Code initially
qrCode.append(document.getElementById("qrCodeContainer"));

// Function to display Text/URL inputs and hide UPI inputs
function showTextUrlInputs() {
  document.getElementById("textUrlInputs").style.display = "block";
  document.getElementById("upiInputs").style.display = "none";
  // Hide UPI-specific message
  document.getElementById("generateMessage").style.display = "none";
  // Clear any existing error messages
  clearGenerateError();
}

// Function to display UPI inputs and hide Text/URL inputs
function showUpiInputs() {
  document.getElementById("textUrlInputs").style.display = "none";
  document.getElementById("upiInputs").style.display = "block";
  // Hide Text/URL-specific error messages
  clearGenerateError();
}

// Function to highlight active button
function highlightActiveButton(activeButtonId) {
  const textUrlButton = document.getElementById("textUrlButton");
  const upiButton = document.getElementById("upiButton");

  if (activeButtonId === "textUrlButton") {
    textUrlButton.classList.add("btn-active");
    textUrlButton.classList.remove("btn-inactive");
    upiButton.classList.add("btn-inactive");
    upiButton.classList.remove("btn-active");
  } else if (activeButtonId === "upiButton") {
    upiButton.classList.add("btn-active");
    upiButton.classList.remove("btn-inactive");
    textUrlButton.classList.add("btn-inactive");
    textUrlButton.classList.remove("btn-active");
  }
}

// Initial highlight on page load
highlightActiveButton("textUrlButton");

// Event listeners for switching inputs
document.getElementById("textUrlButton").addEventListener("click", function () {
  showTextUrlInputs();
  highlightActiveButton("textUrlButton");
});

document.getElementById("upiButton").addEventListener("click", function () {
  showUpiInputs();
  highlightActiveButton("upiButton");
});

// Function to generate QR Code
document.getElementById("generateButton").addEventListener("click", function () {
  if (document.getElementById("textUrlInputs").style.display !== "none") {
    // Text/URL QR code generation
    const textInput = document.getElementById("textInput").value.trim();
    const colorPicker = document.getElementById("colorPicker").value;
    const shapeSelector = document.getElementById("shapeSelector").value;

    if (textInput === "") {
      displayGenerateError("Please enter text or URL to generate QR code.");
      return;
    }

    let qrData = textInput;

    // Function to update QR code
    const updateQRCode = () => {
      qrCode.update({
        data: qrData,
        dotsOptions: {
          type: shapeSelector,
          color: colorPicker
        },
      });
    };

    updateQRCode();
    clearGenerateError();
    // Hide any existing success messages
    document.getElementById("generateMessage").style.display = "none";
  } else {
    // UPI QR code generation
    const amountInput = document.getElementById("amount");
    const upiIdInput = document.getElementById("upiId");
    const noAmountCheckbox = document.getElementById("noAmount");
    const upiId = upiIdInput.value.trim();
    let amount = 0;

    if (!noAmountCheckbox.checked) {
      amount = amountInput.value;
      if (amount === "" || amount < 0 || amount > 100000) {
        displayGenerateError("Please enter a valid amount (up to ₹100,000) or select 'Generate UPI QR without specifying amount'.");
        return;
      }
    }

    if (upiId === "") {
      displayGenerateError("Please enter a UPI ID.");
      return;
    }

    // Construct UPI URI
    let upiURI = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Receiver`;
    if (!noAmountCheckbox.checked) {
      upiURI += `&am=${encodeURIComponent(amount)}&cu=INR`;
    } else {
      upiURI += `&cu=INR`;
    }

    // Get customization options for UPI QR code
    const upiColorPicker = document.getElementById("upiColorPicker").value;
    const upiShapeSelector = document.getElementById("upiShapeSelector").value;

    // Update QRCodeStyling options
    qrCode.update({
      data: upiURI,
      dotsOptions: {
        type: upiShapeSelector,
        color: upiColorPicker
      },
      backgroundOptions: {
        color: "#ffffff",
      }
    });

    // Display the success message
    document.getElementById("generateMessage").textContent = "Scan this QR code using any UPI payment app (e.g., PhonePe, Paytm, GooglePay etc.). Please verify the receiver's name before sending money to ensure the UPI ID is correct and to avoid financial loss.";
    document.getElementById("generateMessage").classList.remove("error");
    document.getElementById("generateMessage").classList.add("success");
    document.getElementById("generateMessage").style.display = "block";

    clearGenerateError();
  }
});

// Function to clear inputs and QR Code
document.getElementById("clearButton").addEventListener("click", function () {
  document.getElementById("generateForm").reset();
  qrCode.update({
    data: "",
    image: ""
  });
  // Clear QRCodeStyling container
  document.getElementById("qrCodeContainer").innerHTML = '';
  document.getElementById("qrResult").style.display = "none";
  clearGenerateError();
  clearScanError();
  // Hide generate message
  document.getElementById("generateMessage").style.display = "none";
  // Reset button highlights
  highlightActiveButton("textUrlButton");
  showTextUrlInputs();
});

// Function to download QR Code
document.getElementById("downloadButton").addEventListener("click", function () {
  const qrContainer = document.getElementById("qrCodeContainer");

  // Check if QRCodeStyling is used (for text/URL and UPI)
  if (qrCode._options.data) { 
    qrCode.download({
      name: "qrcode",
      extension: "png"
    });
  } else {
    // Handle download for qrcodejs (if any)
    if (qrContainer.innerHTML === "") {
      displayGenerateError("No QR code to download. Please generate one first.");
      return;
    }
    const img = qrContainer.querySelector('img');
    if (img) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = img.src;
      link.click();
    } else {
      displayGenerateError("QR code image not found.");
    }
  }
});

// Function to display error messages within generator block
function displayGenerateError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.add("error");
  errorDiv.classList.remove("success");
}

// Function to clear error messages
function clearGenerateError() {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = "";
  errorDiv.classList.remove("error");
  errorDiv.classList.remove("success");
}

// Function to scan QR Code
document.getElementById("scanButton").addEventListener("click", function () {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    displayScanError("Please select an image file to scan.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.src = reader.result;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // Red
        data[i + 1] = avg; // Green
        data[i + 2] = avg; // Blue
      }
      context.putImageData(imageData, 0, 0);

      const code = jsQR(data, canvas.width, canvas.height);

      if (code) {
        const scannedData = code.data;
        if (scannedData.startsWith("upi://")) {
          // It's a UPI QR code
          displayScanError("The uploaded image contains a UPI payment QR code. This QR code is meant to be used in UPI payment apps. Please scan it in UPI payment apps like PhonePe, Paytm, Google Pay, etc.");
          return;
        }
        document.getElementById("resultContent").textContent = scannedData;
        document.getElementById("qrResult").style.display = "block"; // Show the result div
        document.getElementById("copyButton").disabled = false; // Enable copy button
        document.getElementById("downloadTextButton").disabled = false; // Enable download button
        clearScanError();
      } else {
        displayScanError("No QR code found in the image.");
      }
    };
    img.onerror = function () {
      displayScanError("Invalid image file.");
    };
  };
  reader.onerror = function () {
    displayScanError("Failed to read the image file.");
  };
  reader.readAsDataURL(file);
});

// Function to display scan errors
function displayScanError(message) {
  const scanErrorDiv = document.getElementById("ScanErrorMessage");
  scanErrorDiv.textContent = message;
  scanErrorDiv.classList.add("error");
  scanErrorDiv.classList.remove("success");
  document.getElementById("qrResult").style.display = "none"; // Hide result if there's an error
}

// Function to clear scan errors
function clearScanError() {
  const scanErrorDiv = document.getElementById("ScanErrorMessage");
  scanErrorDiv.textContent = "";
  scanErrorDiv.classList.remove("error");
  scanErrorDiv.classList.remove("success");
}

// Function to copy result to clipboard
function copyResult() {
  const resultContent = document.getElementById("resultContent").textContent;
  navigator.clipboard.writeText(resultContent).then(() => {
    alert("Result copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy the result.");
  });
}

// Function to download result as text file
function downloadText() {
  const resultContent = document.getElementById("resultContent").textContent;
  const blob = new Blob([resultContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "qr_result.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// Handle checkbox toggle to disable/enable amount input
document.getElementById("noAmount").addEventListener("change", function () {
  const isChecked = this.checked;
  const amountInput = document.getElementById("amount");
  const amountLabel = document.querySelector('label[for="amount"]');

  if (isChecked) {
    amountInput.disabled = true;
    amountInput.classList.add("disabled");
    amountLabel.classList.add("disabled-label");
  } else {
    amountInput.disabled = false;
    amountInput.classList.remove("disabled");
    amountLabel.classList.remove("disabled-label");
  }
});