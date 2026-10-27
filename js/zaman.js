// Open-Meteo saatleri İstanbul yerel saatiyle "YYYY-AA-GGTSS:DD" dizesi olarak gelir.
// Tüm karşılaştırmalar bu biçimde yapılır; telefonun saat dilimi ne olursa olsun İstanbul saati esas.
export const TZ = 'Europe/Istanbul';

export function simdiYerel(tarih = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(tarih);
  const al = t => p.find(x => x.type === t).value;
  const saat = al('hour') === '24' ? '00' : al('hour');
  return `${al('year')}-${al('month')}-${al('day')}T${saat}:${al('minute')}`;
}

export const tarihOf = t => t.slice(0, 10);
export const saatOf = t => +t.slice(11, 13);
export const hhmm = t => t.slice(11, 16);

// Yerel zaman dizesini dakikaya çevirir (iki zaman arasındaki farkı bulmak için)
export function dakika(t) {
  const ms = Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10), +t.slice(11, 13), +t.slice(14, 16));
  return ms / 60000;
}

// dakika()'nın tersi
export const dakikadan = dk => new Date(dk * 60000).toISOString().slice(0, 16);

export function sureYaz(dk) {
  const s = Math.floor(dk / 60), d = Math.round(dk % 60);
  return s ? `${s} sa ${d} dk` : `${d} dk`;
}
