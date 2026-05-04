import BalanceBar from '../components/BalanceBar';

export default function Tournaments() {
  return (
    <div className="min-h-full pb-24">
      <BalanceBar />
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-extrabold">Турниры</h1>
        <p className="text-sm text-muted">
          Sit&Go и MTT с фиксированным buy-in. Билеты можно купить за TON или Telegram Stars.
        </p>
        <div className="card-surface p-6 mt-4 text-center">
          <div className="text-2xl">🏆</div>
          <div className="font-bold mt-2">Скоро</div>
          <div className="text-xs text-muted mt-1">Запуск турниров — после релиза cash-столов.</div>
        </div>
      </div>
    </div>
  );
}
