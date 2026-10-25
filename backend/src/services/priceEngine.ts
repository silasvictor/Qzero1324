export interface PriceCalculationParams {
  pageCount: number;
  colorMode: 'BW' | 'COLOR';
  duplexMode: 'SINGLE' | 'DOUBLE';
  paperSize: 'A4' | 'A3';
  copies: number;
  printMode: 'INSTANT' | 'SCHEDULED';
  bindingOption?: 'NONE' | 'CORNER_STAPLE' | 'SPIRAL';
}

export interface PriceBreakdown {
  baseRatePerPage: number;
  effectiveSheets: number;
  printingSubtotal: number;
  duplexDiscount: number;
  paperMultiplier: number;
  copiesMultiplier: number;
  bindingFee: number;
  prioritySurgeFee: number;
  totalAmount: number;
  estimatedPrintTimeSec: number;
}

export function calculatePrintPrice(params: PriceCalculationParams): PriceBreakdown {
  const {
    pageCount,
    colorMode,
    duplexMode,
    paperSize,
    copies,
    printMode,
    bindingOption = 'NONE'
  } = params;

  // Base rate per side: BW is ₹1.50, Color is ₹7.00
  const baseRatePerPage = colorMode === 'COLOR' ? 7.0 : 1.5;

  // Paper multiplier: A4 is 1.0, A3 is 1.8
  const paperMultiplier = paperSize === 'A3' ? 1.8 : 1.0;

  // Sheets count: if double-sided, sheets = ceil(pages / 2)
  const effectiveSheets = duplexMode === 'DOUBLE' ? Math.ceil(pageCount / 2) : pageCount;

  // Duplex eco-discount: 15% discount on double-sided prints to encourage paper saving
  const duplexDiscountPercent = duplexMode === 'DOUBLE' ? 0.15 : 0.0;

  const rawPrintCost = pageCount * baseRatePerPage * paperMultiplier * (1 - duplexDiscountPercent);
  const duplexDiscount = duplexMode === 'DOUBLE' ? (pageCount * baseRatePerPage * paperMultiplier * 0.15) : 0;
  
  const printingSubtotal = +(rawPrintCost * copies).toFixed(2);

  // Binding fee
  let bindingFee = 0;
  if (bindingOption === 'CORNER_STAPLE') bindingFee = 5.0 * copies;
  if (bindingOption === 'SPIRAL') bindingFee = 25.0 * copies;

  // Instant / Urgent surge fee (Mode A: 10-second SLA queue jumping)
  const prioritySurgeFee = printMode === 'INSTANT' ? 15.0 : 0.0;

  const totalAmount = +(printingSubtotal + bindingFee + prioritySurgeFee).toFixed(2);

  // Estimated print time formula according to specification:
  // EPT = Twarm + (Npages / PPMnode)
  const Twarm = 8; // seconds
  const PPM = 35; // 35 pages per minute = ~0.58 pages per sec
  const totalPagesToPrint = pageCount * copies;
  const estimatedPrintTimeSec = Math.ceil(Twarm + (totalPagesToPrint / (PPM / 60)));

  return {
    baseRatePerPage,
    effectiveSheets,
    printingSubtotal,
    duplexDiscount: +duplexDiscount.toFixed(2),
    paperMultiplier,
    copiesMultiplier: copies,
    bindingFee,
    prioritySurgeFee,
    totalAmount,
    estimatedPrintTimeSec
  };
}
