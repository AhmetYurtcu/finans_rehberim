import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import dayjs from 'dayjs'
import { expenseByCategory, monthlyIncomeExpense } from '../../db/repositories/transactions'
import { listDebtsWithBalance } from '../../db/repositories/debts'
import { listHoldingsWithMetrics, portfolioValueSeries } from '../../db/repositories/portfolio'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '../../components/Card'
import { CurrencyText } from '../../components/CurrencyText'
import { currentMonthKey } from '../../lib/dateUtils'
import { ExpenseByCategoryChart } from './components/ExpenseByCategoryChart'
import { IncomeExpenseTrendChart } from './components/IncomeExpenseTrendChart'
import { PortfolioValueChart } from './components/PortfolioValueChart'

export function Dashboard() {
  const trend = useLiveQuery(() => monthlyIncomeExpense(6), [])
  const expenseCategories = useLiveQuery(() => expenseByCategory(currentMonthKey()), [])
  const debts = useLiveQuery(() => listDebtsWithBalance(), [])
  const holdings = useLiveQuery(() => listHoldingsWithMetrics(), [])
  const portfolioSeries = useLiveQuery(() => portfolioValueSeries(), [])

  const thisMonth = trend?.at(-1)
  const net = (thisMonth?.income ?? 0) - (thisMonth?.expense ?? 0)

  const debtTotals = useMemo(() => {
    const open = (debts ?? []).filter((d) => d.status === 'open')
    return {
      borrowed: open.filter((d) => d.direction === 'borrowed').reduce((s, d) => s + d.remaining, 0),
      lent: open.filter((d) => d.direction === 'lent').reduce((s, d) => s + d.remaining, 0),
    }
  }, [debts])

  const portfolioTotals = useMemo(() => {
    const value = (holdings ?? []).reduce((s, h) => s + h.value, 0)
    const gainLoss = (holdings ?? []).reduce((s, h) => s + h.gainLoss, 0)
    return { value, gainLoss }
  }, [holdings])

  const trendChartData = (trend ?? []).map((t) => ({
    month: dayjs(t.monthKey, 'YYYY-MM').format('MMM'),
    income: t.income,
    expense: t.expense,
  }))

  const portfolioChartData = (portfolioSeries ?? []).map((p) => ({
    date: dayjs(p.date).format('DD.MM'),
    value: p.value,
  }))

  return (
    <div>
      <PageHeader title="Özet" />

      <div className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-3 gap-2">
          <Card className="text-center">
            <p className="text-xs text-slate-500">Bu Ay Net</p>
            <CurrencyText amount={net} colorize className="text-sm font-medium" />
          </Card>
          <Card className="text-center">
            <p className="text-xs text-slate-500">Açık Borç</p>
            <CurrencyText amount={debtTotals.borrowed} className="text-sm font-medium text-rose-400" />
          </Card>
          <Card className="text-center">
            <p className="text-xs text-slate-500">Portföy</p>
            <CurrencyText amount={portfolioTotals.value} className="text-sm font-medium" />
          </Card>
        </div>

        <Card>
          <h3 className="mb-2 text-sm font-medium text-slate-300">Son 6 Ay: Gelir / Gider</h3>
          <IncomeExpenseTrendChart data={trendChartData} />
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-medium text-slate-300">Bu Ay: Kategoriye Göre Gider</h3>
          <ExpenseByCategoryChart data={expenseCategories ?? []} />
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300">Portföy Değeri</h3>
            <CurrencyText amount={portfolioTotals.gainLoss} colorize className="text-xs font-medium" />
          </div>
          <PortfolioValueChart data={portfolioChartData} />
        </Card>
      </div>
    </div>
  )
}
