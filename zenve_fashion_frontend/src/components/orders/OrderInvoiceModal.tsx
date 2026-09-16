import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Order } from '../../types/order';
import { formatINR, numberToWordsINR } from '../../utils/formatters';

interface OrderInvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  autoPrint = false,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const invoiceNumber = `INV-ZNV-2026-${order?.orderNumber || '00000'}`;
  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  const formattedTime = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const state = order?.shippingAddress?.state?.trim().toLowerCase() || '';
  const isKarnataka = state.includes('karnataka') || state === 'ka';

  // 5% GST calculation for apparel
  const totalAmount = order?.total || 0;
  const taxableValue = Math.round(totalAmount / 1.05);
  const totalTax = totalAmount - taxableValue;
  const cgst = isKarnataka ? Math.round(totalTax / 2) : 0;
  const sgst = isKarnataka ? totalTax - cgst : 0;
  const igst = !isKarnataka ? totalTax : 0;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Tax_Invoice_${order?.orderNumber || 'ZENVE'}_ZENVE_Atelier`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Auto-launch PDF print dialog if requested (e.g. from "DOWNLOAD TAX INVOICE (PDF)")
  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen || !order) return null;

  const modalContent = (
    <div
      id="zenve-invoice-portal"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Complete Print Stylesheet - Guarantees 1-Page Clean Fit and Prevents Element Splitting */}
      <style>{`
        @media print {
          /* Hide all main app content outside the portal */
          #root {
            display: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #zenve-invoice-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }
          #zenve-invoice-portal > div {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #zenve-printable-invoice {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 6mm 8mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #111827 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            box-sizing: border-box !important;
          }
          .invoice-legal-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-totals-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .font-cursive-gold {
            color: #997B28 !important;
            -webkit-text-fill-color: #997B28 !important;
            filter: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm 8mm;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-transparent flex flex-col space-y-3 my-auto">
        
        {/* Floating Action Bar (Hidden in Print) */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#001C13] border border-[#E4BD5A]/35 px-5 py-3 shadow-2xl rounded-sm">
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4BD5A] animate-pulse" />
            <div className="text-left">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#E4BD5A] font-semibold block">
                  OFFICIAL TAX INVOICE
                </span>
                <span className="bg-[#002B1D] text-[#E4BD5A] text-[9px] px-2 py-0.5 border border-[#E4BD5A]/30 font-mono uppercase">
                  A4 1-PAGE OPTIMIZED
                </span>
              </div>
              <span className="font-mono text-xs text-[#F5F0DF]">{invoiceNumber}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="btn-gold py-2 px-4 text-[11px] tracking-wider flex items-center space-x-2 rounded cursor-pointer shadow-lg"
              title="Save as PDF or Print"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD / SAVE AS PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-outline-gold py-2 px-3.5 text-[11px] tracking-wider flex items-center space-x-1.5 rounded cursor-pointer"
              title="Print directly"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#B8B9A8] hover:text-[#F5F0DF] hover:bg-[#002B1D] transition-colors rounded cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Formal A4 Tax Invoice Document (Screen preview & Print document are 100% IDENTICAL) */}
        <div
          id="zenve-printable-invoice"
          ref={printRef}
          className="bg-white text-gray-900 shadow-2xl p-6 sm:p-8 md:p-9 border border-stone-300 relative text-left text-[10.5px] leading-relaxed font-sans select-text"
        >
          {/* Top Decorative Gold Dual Stripe */}
          <div className="w-full h-1 bg-[#002B1D] mb-0.5" />
          <div className="w-full h-0.5 bg-[#C5A059] mb-3.5" />

          {/* 1. ATELIER HEADER & TAX INVOICE METADATA */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3.5 border-b border-gray-200">
            {/* Left: Brand & Registered Entity Info */}
            <div className="space-y-1 max-w-sm">
              <div className="space-y-0.5">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#002B1D] tracking-[0.2em] font-medium uppercase leading-tight">
                  Z E N V E
                </h1>
                <p className="text-[8.5px] font-semibold tracking-[0.25em] uppercase text-[#997B28]">
                  HAUTE COUTURE & LUXURY ATELIER
                </p>
              </div>

              <div className="pt-1 text-[10px] text-gray-600 leading-snug space-y-0.5">
                <p className="font-semibold text-gray-900">ZENVE FASHION ATELIER PRIVATE LIMITED</p>
                <p>The Collection, UB City, Level 2, 24 Vittal Mallya Road</p>
                <p>Bengaluru, Karnataka - 560001, India</p>
                <div className="pt-0.5 font-mono text-[9.5px] space-y-0.5 text-gray-700">
                  <p><strong>GSTIN:</strong> 29AAACZ1924K1Z5 <span className="text-gray-400">|</span> <strong>PAN:</strong> AAACZ1924K</p>
                  <p><strong>CIN:</strong> U18101KA2024PTC188294 <span className="text-gray-400">|</span> <strong>State Code:</strong> 29 (Karnataka)</p>
                  <p><strong>Concierge:</strong> concierge@zenvefashion.com <span className="text-gray-400">|</span> +91 (080) 4920-ZENVE</p>
                </div>
              </div>
            </div>

            {/* Right: Invoice Number & Tax Status Box */}
            <div className="text-right sm:text-right space-y-1.5 self-stretch sm:self-auto flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#002B1D] text-[#E4BD5A] text-[8.5px] font-bold tracking-[0.2em] uppercase px-2.5 py-0.5">
                  TAX INVOICE
                </span>
                <p className="text-[8.5px] text-gray-500 tracking-wider uppercase pt-0.5">
                  ORIGINAL FOR RECIPIENT
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-2 text-[10px] space-y-0.5 font-mono">
                <div className="flex justify-between sm:justify-end gap-2.5">
                  <span className="text-gray-500">Invoice No:</span>
                  <strong className="text-gray-900">{invoiceNumber}</strong>
                </div>
                <div className="flex justify-between sm:justify-end gap-2.5">
                  <span className="text-gray-500">Invoice Date:</span>
                  <span className="text-gray-900">{formattedDate}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-2.5">
                  <span className="text-gray-500">Order Ref:</span>
                  <span className="text-gray-900">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-2.5">
                  <span className="text-gray-500">Place of Supply:</span>
                  <span className="text-gray-900">{order.shippingAddress?.state || 'Karnataka'}, India</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-2.5">
                  <span className="text-gray-500">Reverse Charge:</span>
                  <span className="text-gray-900">No</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BILLED TO & SHIPPED TO SECTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-gray-200 text-[10px]">
            
            {/* Billed To */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[#002B1D] border-b border-stone-200 pb-0.5">
                <span className="w-1.5 h-1.5 bg-[#C5A059]" />
                <h3 className="font-semibold uppercase tracking-wider text-[9.5px] text-gray-800">
                  BILLED TO (CUSTOMER DETAILS)
                </h3>
              </div>
              <p className="font-bold text-gray-900 text-[11px]">{order.shippingAddress?.fullName || 'Client'}</p>
              <p className="text-gray-600 leading-tight">{order.shippingAddress?.addressLine1 || 'Delivery Address'}</p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-600 leading-tight">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} - {order.shippingAddress?.pincode || ''}
              </p>
              <p className="text-gray-600">Country: {order.shippingAddress?.country || 'India'}</p>
              <p className="pt-0.5 text-gray-800 font-mono text-[9.5px]">
                <strong>Mobile:</strong> {order.shippingAddress?.mobile || 'N/A'}
              </p>
              <p className="text-gray-500 text-[9px]">
                State/UT Code: {isKarnataka ? '29 (Karnataka)' : (order.shippingAddress?.state || 'N/A')}
              </p>
            </div>

            {/* Shipped To */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[#002B1D] border-b border-stone-200 pb-0.5">
                <span className="w-1.5 h-1.5 bg-[#C5A059]" />
                <h3 className="font-semibold uppercase tracking-wider text-[9.5px] text-gray-800">
                  SHIPPED TO (CONSIGNEE ADDRESS)
                </h3>
              </div>
              <p className="font-bold text-gray-900 text-[11px]">{order.shippingAddress?.fullName || 'Client'}</p>
              <p className="text-gray-600 leading-tight">{order.shippingAddress?.addressLine1 || 'Delivery Address'}</p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-600 leading-tight">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} - {order.shippingAddress?.pincode || ''}
              </p>
              <div className="pt-1 bg-stone-50 p-1.5 border border-stone-200 text-[9px] space-y-0.5 font-mono text-gray-700">
                <p><strong>Logistics Partner:</strong> Zenve White-Glove Insured Express</p>
                <p><strong>AWB Dispatch Ref:</strong> ZNV-EXP-{order.orderNumber}-BLR</p>
                <p><strong>Delivery Estimate:</strong> {order.estimatedDelivery || 'Next Day Delivery'}</p>
              </div>
            </div>

          </div>

          {/* 3. ITEMIZED TAX TABLE */}
          <div className="py-3">
            <table className="w-full text-left border-collapse border border-gray-200 text-[10px]">
              <thead>
                <tr className="bg-[#002B1D] text-white">
                  <th className="py-1.5 px-2 border border-[#002B1D] w-7 text-center text-[9.5px] font-semibold">#</th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold tracking-wider uppercase">
                    Description of Atelier Piece & SKU
                  </th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-center w-16">HSN</th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-center w-24">Variant</th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-center w-10">Qty</th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-right w-20">
                    Unit Price
                  </th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-right w-20">
                    Taxable (₹)
                  </th>
                  <th className="py-1.5 px-2 border border-[#002B1D] text-[9.5px] font-semibold text-right w-20">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const itemTotal = item.price * item.quantity;
                    const itemTaxable = Math.round(itemTotal / 1.05);

                    return (
                      <tr key={item.id || idx} className="hover:bg-stone-50">
                        <td className="py-2 px-2 text-center border-r border-gray-200 text-gray-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 border-r border-gray-200">
                          <p className="font-semibold text-gray-900 text-[10.5px]">
                            {item.product?.name || 'Tailored Garment'}
                          </p>
                          <p className="text-[9px] text-[#997B28] uppercase tracking-wider">
                            {item.product?.collection || 'Haute Couture'}
                          </p>
                          <p className="text-[8.5px] text-gray-400 font-mono">
                            SKU: ZNV-{String(item.product?.id || '10001').padStart(5, '0')}
                          </p>
                        </td>
                        <td className="py-2 px-2 text-center border-r border-gray-200 font-mono text-gray-600 text-[9.5px]">
                          6204
                        </td>
                        <td className="py-2 px-2 text-center border-r border-gray-200 text-[9.5px] text-gray-700">
                          <span>Size: <strong>{item.selectedSize || 'Free Size'}</strong></span>
                          <br />
                          <span className="text-gray-500">Color: {item.selectedColor?.name || 'Standard'}</span>
                        </td>
                        <td className="py-2 px-2 text-center border-r border-gray-200 font-mono text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200 font-mono text-gray-700">
                          {formatINR(item.price)}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-gray-200 font-mono text-gray-700">
                          {formatINR(itemTaxable)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-semibold text-gray-900">
                          {formatINR(itemTotal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-3 text-center text-gray-500">
                      No item lines recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. FINANCIAL TOTALS, TAX BREAKDOWN & AMOUNT IN WORDS */}
          <div className="invoice-totals-section grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1 pb-3 border-b border-gray-200 text-[10px]">
            
            {/* Left: Amount in Words, Bank/Payment, Tax Matrix (7 cols) */}
            <div className="sm:col-span-7 space-y-2.5">
              
              {/* Amount In Words */}
              <div className="bg-stone-50 border border-stone-200 p-2 rounded-sm space-y-0.5">
                <span className="text-[8.5px] uppercase tracking-widest text-gray-500 font-semibold block">
                  INVOICE AMOUNT IN WORDS:
                </span>
                <p className="font-serif text-[12.5px] font-semibold text-[#002B1D] italic">
                  {numberToWordsINR(totalAmount)}
                </p>
              </div>

              {/* GST Tax Breakdown Matrix */}
              <div className="border border-stone-200 p-2 space-y-1.5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1">
                  <span className="text-[9px] uppercase tracking-wider text-gray-700 font-bold">
                    GST TAX BREAKDOWN MATRIX
                  </span>
                  <span className="text-[8.5px] text-gray-500">5% Luxury Apparel</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[9.5px] text-gray-600">
                  <div>
                    <span className="text-gray-400 block text-[8.5px]">Taxable Amount</span>
                    <strong className="text-gray-900">{formatINR(taxableValue)}</strong>
                  </div>
                  {isKarnataka ? (
                    <>
                      <div>
                        <span className="text-gray-400 block text-[8.5px]">CGST (2.5%)</span>
                        <strong className="text-gray-900">{formatINR(cgst)}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8.5px]">SGST (2.5%)</span>
                        <strong className="text-gray-900">{formatINR(sgst)}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-400 block text-[8.5px]">IGST (5.0%)</span>
                        <strong className="text-gray-900">{formatINR(igst)}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8.5px]">State Cess</span>
                        <strong className="text-gray-900">₹0</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Disposition Badge */}
              <div className="flex items-center space-x-2 text-[9.5px]">
                <span className="text-gray-600">Payment:</span>
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 font-semibold text-[9px] tracking-wider uppercase">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>
                    {order.paymentStatus === 'completed'
                      ? `PAID VIA ${(order.paymentMethod || 'CARD').toUpperCase()}`
                      : `${(order.paymentStatus || 'PENDING').toUpperCase()} (${(order.paymentMethod || 'COD').toUpperCase()})`}
                  </span>
                </span>
                <span className="text-gray-400 text-[8.5px] font-mono">
                  Txn Ref: ZNV-TXN-{order.orderNumber}
                </span>
              </div>

            </div>

            {/* Right: Summary Figures (5 cols) */}
            <div className="sm:col-span-5 bg-stone-50 border border-stone-200 p-2.5 space-y-1.5 font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Gross Item Subtotal:</span>
                <span className="font-semibold text-gray-800">{formatINR(order.subtotal || totalAmount)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-[#997B28]">
                  <span>Privilege Courtesy:</span>
                  <span className="font-semibold">- {formatINR(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Net Taxable Value:</span>
                <span>{formatINR(taxableValue)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Total GST (5%):</span>
                <span>{formatINR(totalTax)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>White-Glove Insured Delivery:</span>
                <span className="text-emerald-700 font-semibold uppercase text-[9.5px]">FREE</span>
              </div>

              <div className="pt-1.5 border-t-2 border-[#002B1D] flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-[#002B1D] uppercase tracking-wider font-sans">
                  Total Settlement:
                </span>
                <span className="font-serif text-lg font-bold text-[#002B1D]">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

          </div>

          {/* 5. LEGAL CERTIFICATION & DIGITAL SIGNATURE / STAMP */}
          <div className="invoice-legal-section pt-3 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end text-[9.5px] text-gray-600">
            
            {/* Terms & Certification (8 cols) */}
            <div className="sm:col-span-8 space-y-1">
              <p className="font-semibold text-gray-800 uppercase tracking-wider text-[8.5px]">
                TERMS & CONDITIONS OF COMMISSION:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-500 leading-snug text-[8.5px]">
                <li>This is an authentic computer-generated Tax Invoice in compliance with GST Act, 2017.</li>
                <li>Atelier commissions are tailored under certified master artisan quality benchmarks.</li>
                <li>Complimentary alteration or exchange available within 14 days of receipt in unworn condition.</li>
                <li>All disputes are subject to the exclusive jurisdiction of the Courts in Bengaluru, Karnataka.</li>
              </ul>
            </div>

            {/* Official Signature & Seal Block (4 cols) */}
            <div className="sm:col-span-4 flex flex-col items-center sm:items-end text-center sm:text-right space-y-1">
              <div className="text-[8.5px] uppercase tracking-wider font-semibold text-gray-700">
                FOR ZENVE FASHION ATELIER PVT. LTD.
              </div>

              {/* Digital Atelier Verification Seal Stamp (Streamlined so it never overflows) */}
              <div className="w-16 h-16 rounded-full border border-dashed border-[#997B28] p-0.5 flex items-center justify-center relative bg-amber-50/40">
                <div className="w-full h-full rounded-full border border-[#997B28] flex flex-col items-center justify-center text-center p-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#997B28] mb-0.5" />
                  <span className="font-serif font-bold text-[7px] text-[#002B1D] tracking-widest leading-none">
                    ZENVE
                  </span>
                  <span className="text-[5.5px] uppercase tracking-wider text-[#997B28] font-bold mt-0.5">
                    VERIFIED SEAL
                  </span>
                  <span className="text-[5px] font-mono text-gray-500">BENGALURU</span>
                </div>
              </div>

              <div className="pt-0.5 text-center sm:text-right">
                <span className="font-cursive-gold text-sm text-[#997B28] block italic leading-none">
                  Ajeeth Vasanth
                </span>
                <span className="text-[7.5px] tracking-wider uppercase text-gray-500 font-semibold block border-t border-gray-300 pt-0.5 mt-0.5">
                  Authorised Signatory
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Gold Stripe */}
          <div className="w-full h-0.5 bg-[#C5A059] mt-3" />
          <div className="w-full h-1 bg-[#002B1D] mt-0.5" />

          {/* Footer Note */}
          <div className="pt-1.5 text-center text-[8.5px] text-gray-400 tracking-wider">
            Thank you for choosing ZENVE Haute Couture Atelier. Generated at {formattedTime} on {formattedDate}.
          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
