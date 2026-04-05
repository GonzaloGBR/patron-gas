import { getClientLoans, getAllClients, getProducts } from "@/actions/loans"
import LoanForm from "./LoanForm"
import ResolveLoanButton from "./ResolveLoanButton"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = "force-dynamic"

export default async function LoansPage() {
  const loans = await getClientLoans()
  const clients = await getAllClients()
  const products = await getProducts()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="pb-4">
        <h1 className="text-3xl font-extrabold text-[#1b3b50] tracking-tight">Cta. Cte. de Envases</h1>
        <p className="text-slate-500 font-medium mt-1">Control de préstamos y devoluciones de vacíos por cliente.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1">
          <LoanForm clients={clients} products={products} />
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-2xl border border-slate-100 overflow-hidden">
            <div className="bg-white px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Deudores Actuales</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance (Vacíos)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actualizado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {loans.map((loan: any) => (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {loan.client.first_name} {loan.client.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {loan.product.brand} {loan.product.weight}kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {loan.quantity_owed > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                            DEBE {loan.quantity_owed}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                            A FAVOR {Math.abs(loan.quantity_owed)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-500">
                        {format(new Date(loan.updated_at), "dd MMM yy", { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ResolveLoanButton loanId={loan.id} quantity={loan.quantity_owed} />
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No hay clientes que deban envases actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
