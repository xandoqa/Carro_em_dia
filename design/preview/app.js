/**
 * Protótipo navegável do CarroEmDia.
 *
 * Reproduz as 10 telas do app em HTML, usando exatamente os mesmos tokens de
 * design/tokens/tokens.json. Serve para ver e demonstrar o app sem precisar
 * rodar o Expo — útil na apresentação e para revisar o design sem build.
 *
 * Não é o app: é uma maquete fiel. A lógica aqui é só de navegação e troca de
 * tema; as regras de negócio de verdade vivem em src/domain.
 */

/* ========================================================================== */
/* Temas — espelham src/theme/palettes.ts                                     */
/* ========================================================================== */

const TEMAS = {
  oficina: {
    nome: 'Oficina',
    descricao: 'Claro, verde-petróleo sobre papel cinza.',
    esquema: 'light',
    cores: {
      background: '#F2F3F0', surface: '#FFFFFF', surfaceSunken: '#EDEFEB',
      surfaceRaised: '#FFFFFF', text: '#15201C', textMuted: '#5E6B66',
      textOnBrand: '#FFFFFF', line: '#D8DCD6', lineStrong: '#A9B2AC',
      brand: '#0F4D45', brandPressed: '#0A3A34', brandSoft: '#D7E8E3',
      ok: '#2F7D5B', okSoft: '#DCEFE4', warn: '#A86D12', warnSoft: '#F6E8CF',
      late: '#B23A2E', lateSoft: '#F7DFDC', scrim: 'rgba(21,32,28,.44)',
    },
  },
  asfalto: {
    nome: 'Asfalto',
    descricao: 'Escuro, verde-petróleo. Padrão no modo escuro.',
    esquema: 'dark',
    cores: {
      background: '#101513', surface: '#171E1B', surfaceSunken: '#0C110F',
      surfaceRaised: '#1F2825', text: '#E8EDE9', textMuted: '#8D9A94',
      textOnBrand: '#06211D', line: '#2A3531', lineStrong: '#415049',
      brand: '#3FB89F', brandPressed: '#359C87', brandSoft: '#15322D',
      ok: '#4FBF8B', okSoft: '#13301F', warn: '#E0A33A', warnSoft: '#33260F',
      late: '#FF6B5B', lateSoft: '#3A1A17', scrim: 'rgba(0,0,0,.62)',
    },
  },
  ambar: {
    nome: 'Âmbar',
    descricao: 'Escuro e quente, como a luz do painel à noite.',
    esquema: 'dark',
    cores: {
      background: '#140F0A', surface: '#1C150E', surfaceSunken: '#100C07',
      surfaceRaised: '#251C12', text: '#F2E6D4', textMuted: '#9C8A72',
      textOnBrand: '#1F1405', line: '#33281B', lineStrong: '#4C3C28',
      brand: '#E8A33D', brandPressed: '#C9892C', brandSoft: '#352512',
      ok: '#9BBF6A', okSoft: '#232B16', warn: '#E8A33D', warnSoft: '#352512',
      late: '#E2564A', lateSoft: '#361713', scrim: 'rgba(0,0,0,.66)',
    },
  },
  pista: {
    nome: 'Pista',
    descricao: 'Claro e de alto contraste, para sol forte.',
    esquema: 'light',
    cores: {
      background: '#FFFFFF', surface: '#FFFFFF', surfaceSunken: '#F0F0EE',
      surfaceRaised: '#FFFFFF', text: '#0B0F0D', textMuted: '#454B48',
      textOnBrand: '#FFFFFF', line: '#9BA19E', lineStrong: '#0B0F0D',
      brand: '#1C1C1A', brandPressed: '#000000', brandSoft: '#FFE38A',
      ok: '#19663F', okSoft: '#D8EFE2', warn: '#8A5A00', warnSoft: '#FFE9B8',
      late: '#99241A', lateSoft: '#FBD9D5', scrim: 'rgba(11,15,13,.52)',
    },
  },
};

/* ========================================================================== */
/* Ícones — espelham src/icons/ServiceIcon.tsx                                */
/* ========================================================================== */

const T = (c, w = 1.8) =>
  `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

const svg = (corpo, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${corpo}</svg>`;

const ICONES = {
  oleo: (c, s) => svg(`<path d="M12 9.5c2 2.2 3 3.8 3 5.2a3 3 0 0 1-6 0c0-1.4 1-3 3-5.2Z" ${T(c)}/><path d="M5 5h7l2 2.5" ${T(c)}/><line x1="5" y1="5" x2="5" y2="8" ${T(c)}/>`, s),
  pneus: (c, s) => svg(`<circle cx="12" cy="12" r="8.2" ${T(c)}/><circle cx="12" cy="12" r="3.4" ${T(c)}/><line x1="12" y1="3.8" x2="12" y2="8.6" ${T(c)}/><line x1="12" y1="15.4" x2="12" y2="20.2" ${T(c)}/><line x1="3.8" y1="12" x2="8.6" y2="12" ${T(c)}/><line x1="15.4" y1="12" x2="20.2" y2="12" ${T(c)}/>`, s),
  freios: (c, s) => svg(`<circle cx="11" cy="12" r="7.6" ${T(c)}/><circle cx="11" cy="12" r="2.6" ${T(c)}/><path d="M17.4 8.2h2.2a1.4 1.4 0 0 1 1.4 1.4v4.8a1.4 1.4 0 0 1-1.4 1.4h-2.2" ${T(c)}/>`, s),
  bateria: (c, s) => svg(`<rect x="3" y="8" width="18" height="11" rx="1.6" ${T(c)}/><line x1="7.5" y1="8" x2="7.5" y2="5.5" ${T(c)}/><line x1="16.5" y1="8" x2="16.5" y2="5.5" ${T(c)}/><line x1="7.8" y1="13.5" x2="11" y2="13.5" ${T(c)}/><line x1="14.8" y1="13.5" x2="18" y2="13.5" ${T(c)}/><line x1="16.4" y1="11.9" x2="16.4" y2="15.1" ${T(c)}/>`, s),
  revisao: (c, s) => svg(`<path d="M15.6 4.4a4.2 4.2 0 0 0-5.3 5.3L4.6 15.4a1.9 1.9 0 0 0 2.7 2.7l5.7-5.7a4.2 4.2 0 0 0 5.3-5.3l-2.4 2.4-2.3-.6-.6-2.3 2.6-2.2Z" ${T(c)}/><circle cx="6.2" cy="16.8" r="0.9" fill="${c}"/>`, s),
  filtros: (c, s) => svg(`<rect x="4" y="5" width="16" height="14" rx="2" ${T(c)}/><line x1="8" y1="8" x2="8" y2="16" ${T(c)}/><line x1="12" y1="8" x2="12" y2="16" ${T(c)}/><line x1="16" y1="8" x2="16" y2="16" ${T(c)}/>`, s),
  abastecimento: (c, s) => svg(`<path d="M5 20V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v14" ${T(c)}/><line x1="3.6" y1="20" x2="15.4" y2="20" ${T(c)}/><line x1="7" y1="8.4" x2="12" y2="8.4" ${T(c)}/><path d="M14 9h3a2 2 0 0 1 2 2v4.4a1.6 1.6 0 0 1-3.2 0V13" ${T(c)}/>`, s),
  outro: (c, s) => svg(`<rect x="5" y="4.5" width="14" height="16" rx="2" ${T(c)}/><path d="M9.2 4.5V3.4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1v1.1" ${T(c)}/><line x1="8.8" y1="10.5" x2="15.2" y2="10.5" ${T(c)}/><line x1="8.8" y1="14.5" x2="13" y2="14.5" ${T(c)}/>`, s),
};

const glifoCarro = (c, s = 28) => svg(`<path d="M4 16.2v-3.4L5.8 8A2 2 0 0 1 7.7 6.7h8.6A2 2 0 0 1 18.2 8L20 12.8v3.4" ${T(c, 1.6)}/><line x1="3.4" y1="12.9" x2="20.6" y2="12.9" ${T(c, 1.6)}/><circle cx="7.4" cy="16.4" r="1.5" ${T(c, 1.6)}/><circle cx="16.6" cy="16.4" r="1.5" ${T(c, 1.6)}/>`, s);
const glifoMoto = (c, s = 28) => svg(`<circle cx="5.2" cy="16.4" r="3.4" ${T(c, 1.6)}/><circle cx="18.8" cy="16.4" r="3.4" ${T(c, 1.6)}/><path d="M5.2 16.4 9 10.6h4.6l2.2 2.9" ${T(c, 1.6)}/><path d="M18.8 16.4 16 10.6" ${T(c, 1.6)}/><path d="M9.4 8.2h2.4" ${T(c, 1.6)}/><path d="M13.6 10.6 15.4 7.4h2.2" ${T(c, 1.6)}/>`, s);
const glifo = (tipo, c, s) => (tipo === 'moto' ? glifoMoto(c, s) : glifoCarro(c, s));

const marca = (c, a, s = 24) =>
  `<svg viewBox="0 0 32 32" width="${s}" height="${s}" fill="none" aria-hidden="true"><path d="M5 23a13 13 0 1 1 22 0" stroke="${c}" stroke-width="2" stroke-linecap="round"/><line x1="6.6" y1="15.4" x2="9.2" y2="16.2" stroke="${c}" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="5.4" x2="16" y2="8.1" stroke="${c}" stroke-width="2" stroke-linecap="round"/><line x1="25.4" y1="15.4" x2="22.8" y2="16.2" stroke="${c}" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="23" x2="21.4" y2="13.6" stroke="${a}" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="23" r="2.2" fill="${a}"/></svg>`;

/** Ícones de interface, equivalentes aos Ionicons usados no app. */
const UI = {
  voltar: (c) => svg(`<path d="M15 5l-7 7 7 7" ${T(c, 2)}/>`, 24),
  avancar: (c, s = 20) => svg(`<path d="M9 5l7 7-7 7" ${T(c, 2)}/>`, s),
  engrenagem: (c, s = 22) => svg(`<circle cx="12" cy="12" r="3.2" ${T(c, 1.7)}/><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" ${T(c, 1.7)}/>`, s),
  carro: (c, s = 24) => svg(`<path d="M4 16.2v-3.4L5.8 8A2 2 0 0 1 7.7 6.7h8.6A2 2 0 0 1 18.2 8L20 12.8v3.4" ${T(c, 1.7)}/><line x1="3.4" y1="12.9" x2="20.6" y2="12.9" ${T(c, 1.7)}/><circle cx="7.4" cy="16.4" r="1.4" ${T(c, 1.7)}/><circle cx="16.6" cy="16.4" r="1.4" ${T(c, 1.7)}/>`, s),
  sino: (c, s = 24) => svg(`<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z" ${T(c, 1.7)}/><path d="M13.7 19.5a2 2 0 0 1-3.4 0" ${T(c, 1.7)}/>`, s),
  grafico: (c, s = 24) => svg(`<line x1="4" y1="20" x2="20" y2="20" ${T(c, 1.7)}/><rect x="6" y="12" width="3.4" height="6" rx="1" ${T(c, 1.7)}/><rect x="11.5" y="8" width="3.4" height="10" rx="1" ${T(c, 1.7)}/><rect x="17" y="14" width="3.4" height="4" rx="1" ${T(c, 1.7)}/>`, s),
  mais: (c, s = 20) => svg(`<line x1="12" y1="5" x2="12" y2="19" ${T(c, 2.2)}/><line x1="5" y1="12" x2="19" y2="12" ${T(c, 2.2)}/>`, s),
  camera: (c, s = 18) => svg(`<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" ${T(c, 1.6)}/><circle cx="12" cy="13" r="3.4" ${T(c, 1.6)}/>`, s),
  velocimetro: (c, s = 17) => svg(`<path d="M5 18a9 9 0 1 1 14 0" ${T(c, 1.7)}/><line x1="12" y1="18" x2="16" y2="11" ${T(c, 1.7)}/>`, s),
  lapis: (c, s = 18) => svg(`<path d="M4 20h4l10-10a2.1 2.1 0 1 0-3-3L5 17Z" ${T(c, 1.7)}/>`, s),
  busca: (c, s = 18) => svg(`<circle cx="11" cy="11" r="6.4" ${T(c, 1.7)}/><line x1="15.8" y1="15.8" x2="20" y2="20" ${T(c, 1.7)}/>`, s),
  baixo: (c, s = 18) => svg(`<path d="M6 9.5l6 6 6-6" ${T(c, 1.9)}/>`, s),
  check: (c, s = 20) => svg(`<path d="M5 12.5l4.5 4.5L19 7.5" ${T(c, 2.1)}/>`, s),
  fechar: (c, s = 22) => svg(`<line x1="6" y1="6" x2="18" y2="18" ${T(c, 1.9)}/><line x1="18" y1="6" x2="6" y2="18" ${T(c, 1.9)}/>`, s),
};

/* ========================================================================== */
/* Dados de exemplo — espelham src/data/demoRoteiros.ts                       */
/* ========================================================================== */

const VEICULOS = [
  {
    id: 'v1', apelido: 'Gol do trabalho', tipo: 'carro',
    marca: 'Volkswagen', modelo: 'Gol 1.0 Flex', ano: 2018,
    placa: 'BRA 2E19', km: 114500,
    lembrete: {
      tipo: 'filtros', nome: 'Filtro de cabine', status: 'vencido',
      texto: 'Venceu há 300 km', de: '99.200 km', ate: '114.200 km', p: 1.02,
    },
  },
  {
    id: 'v2', apelido: 'Fan do dia a dia', tipo: 'moto',
    marca: 'Honda', modelo: 'CG 160 Fan', ano: 2021,
    placa: 'XYZ 9A88', km: 28200,
    lembrete: {
      tipo: 'oleo', nome: 'Troca de óleo e filtro', status: 'atencao',
      texto: 'Faltam 300 km', de: '25.500 km', ate: '28.500 km', p: 0.9,
    },
  },
];

const ALERTAS = [
  { veiculo: 'Gol do trabalho', tipo: 'filtros', nome: 'Filtro de cabine', status: 'vencido', texto: 'Venceu há 300 km', de: '99.200 km', ate: '114.200 km', p: 1.02 },
  { veiculo: 'Fan do dia a dia', tipo: 'revisao', nome: 'Revisão geral', status: 'vencido', texto: 'Venceu há 31 dias', de: '18 out 2025', ate: '08 out 2026', p: 1.05 },
  { veiculo: 'Gol do trabalho', tipo: 'oleo', nome: 'Troca de óleo e filtro', status: 'atencao', texto: 'Faltam 500 km', de: '105.000 km', ate: '115.000 km', p: 0.95 },
  { veiculo: 'Fan do dia a dia', tipo: 'oleo', nome: 'Troca de óleo e filtro', status: 'atencao', texto: 'Faltam 300 km', de: '25.500 km', ate: '28.500 km', p: 0.9 },
  { veiculo: 'Fan do dia a dia', tipo: 'freios', nome: 'Freios', status: 'atencao', texto: 'Faltam 600 km', de: '23.800 km', ate: '28.800 km', p: 0.88 },
  { veiculo: 'Gol do trabalho', tipo: 'freios', nome: 'Freios', status: 'em-dia', texto: 'Faltam 23.700 km', de: '108.200 km', ate: '138.200 km', p: 0.21 },
  { veiculo: 'Gol do trabalho', tipo: 'pneus', nome: 'Pneus', status: 'em-dia', texto: 'Faltam 28.000 km', de: '102.500 km', ate: '142.500 km', p: 0.3 },
];

const HISTORICO = [
  { tipo: 'abastecimento', nome: 'Abastecimento', data: '08 nov 2026', km: '114.480 km', extra: '29,2 L', valor: '165,00', oficina: 'Posto da Rodovia' },
  { tipo: 'abastecimento', nome: 'Abastecimento', data: '08 out 2026', km: '114.110 km', extra: '30,4 L', valor: '172,00', oficina: 'Posto Central' },
  { tipo: 'abastecimento', nome: 'Abastecimento', data: '08 set 2026', km: '113.720 km', extra: '32,1 L', valor: '180,00', oficina: 'Posto Central' },
  { tipo: 'freios', nome: 'Pastilhas dianteiras', data: '08 fev 2026', km: '108.200 km', valor: '340,00', oficina: 'Freio Rápido' },
  { tipo: 'oleo', nome: 'Troca de óleo e filtro', data: '08 abr 2026', km: '105.000 km', valor: '280,00', oficina: 'AutoCar Express' },
  { tipo: 'filtros', nome: 'Filtro de cabine', data: '08 set 2025', km: '99.200 km', valor: '120,00', oficina: 'AutoCar Express' },
  { tipo: 'pneus', nome: 'Alinhamento e balanceamento', data: '08 jul 2025', km: '102.500 km', valor: '120,00', oficina: 'Pneus & Cia' },
];

const TIPOS = [
  ['oleo', 'Óleo e filtro'], ['pneus', 'Pneus'], ['freios', 'Freios'],
  ['bateria', 'Bateria'], ['revisao', 'Revisão geral'], ['filtros', 'Filtros'],
  ['abastecimento', 'Abastecer'], ['outro', 'Outro'],
];

/* ========================================================================== */
/* Estado                                                                      */
/* ========================================================================== */

const estado = {
  tema: 'oficina',
  tela: 'garagem',
  aba: 'veiculos',
  abaPainel: 'historico',
  filtroAlertas: 'pendentes',
  periodoGastos: 'doze',
  tipoSelecionado: 'oleo',
  folha: null,
  historico: [],
};

const c = () => TEMAS[estado.tema].cores;

/* ========================================================================== */
/* Helpers de composição                                                       */
/* ========================================================================== */

/** Cor do estado de um lembrete. */
const corStatus = (s) => (s === 'vencido' ? c().late : s === 'atencao' ? c().warn : c().ok);

const rotuloStatus = { 'em-dia': 'Em dia', atencao: 'Chegando', vencido: 'Vencido' };

function chip(status, texto) {
  const cor = corStatus(status);
  const fundo = status === 'vencido' ? c().lateSoft : status === 'atencao' ? c().warnSoft : c().okSoft;
  return `<span class="chip" style="background:${fundo};color:${cor}">
    <i style="background:${cor}"></i>${texto || rotuloStatus[status]}</span>`;
}

/** Faixa de medida — o elemento assinatura. */
function faixa(p, status, de, ate, ticks = 10) {
  const cor = corStatus(status);
  const estourou = p > 1;
  const w = Math.min(Math.max(p, 0), 1) * 100;
  let escala = '';
  for (let i = 1; i < ticks; i++) {
    escala += `<i class="${i === ticks / 2 ? 'mid' : ''}" style="left:${(i / ticks) * 100}%;background:${c().lineStrong}"></i>`;
  }
  return `
  <div class="faixa-wrap">
    <div class="faixa" style="background:${c().surfaceSunken};border-color:${c().line}">
      <div class="escala">${escala}</div>
      <div class="fill" style="width:${w}%;background:${cor};opacity:${estourou ? 1 : 0.4}"></div>
      <div class="cursor" style="left:${w}%;background:${estourou ? c().surface : cor};border-color:${estourou ? cor : c().surface}"></div>
    </div>
    ${de || ate ? `<div class="pontas"><span style="color:${c().textMuted}">${de || ''}</span><span style="color:${estourou ? cor : c().textMuted}">${ate || ''}</span></div>` : ''}
  </div>`;
}

function cabecalho(titulo, subtitulo, { voltar = false, acao = '' } = {}) {
  return `<header class="head">
    ${voltar ? `<button class="icone-btn" data-voltar aria-label="Voltar">${UI.voltar(c().text)}</button>` : ''}
    <div class="head-txt">
      <h1 style="color:${c().text}">${titulo}</h1>
      ${subtitulo ? `<p style="color:${c().textMuted}">${subtitulo}</p>` : ''}
    </div>
    ${acao}
  </header>`;
}

function cartao(conteudo, { accent = '', flush = false, acao = '' } = {}) {
  return `<div class="card ${acao ? 'tocavel' : ''}" ${acao ? `data-ir="${acao}" role="button" tabindex="0"` : ''}
    style="background:${c().surface};border-color:${accent || c().line};${flush ? 'padding:0' : ''}">${conteudo}</div>`;
}

function leitura(rotulo, valor, dica, { grande = false } = {}) {
  return `<div class="leitura" style="background:${c().surfaceSunken};border-color:${c().line}">
    <div class="rotulo" style="color:${c().textMuted}">${rotulo}</div>
    <div class="medida ${grande ? 'xl' : 'lg'}" style="color:${c().text}">${valor}</div>
    ${dica ? `<div class="dica" style="color:${c().textMuted}">${dica}</div>` : ''}
  </div>`;
}

function botao(texto, { variante = 'primary', icone = '', acao = '', destrutivo = false } = {}) {
  const destaque = destrutivo ? c().late : c().brand;
  const estilos = {
    primary: `background:${destaque};color:${c().textOnBrand}`,
    secondary: `background:transparent;color:${destaque};border:1px solid ${destaque}`,
    ghost: `background:transparent;color:${destrutivo ? c().late : c().textMuted}`,
  };
  return `<button class="btn" style="${estilos[variante]}" ${acao ? `data-ir="${acao}"` : ''}>
    ${icone}<span>${texto}</span></button>`;
}

function campo(rotulo, valor, { dica = '', sufixo = '', mono = false, placeholder = false, area = false } = {}) {
  return `<div class="campo">
    <div class="rotulo" style="color:${c().textMuted}">${rotulo}</div>
    <div class="campo-caixa ${area ? 'area' : ''}" style="background:${c().surfaceSunken};border-color:${c().line}">
      <span class="${mono ? 'mono' : ''}" style="color:${placeholder ? c().textMuted : c().text}">${valor}</span>
      ${sufixo ? `<span class="mono sufixo" style="color:${c().textMuted}">${sufixo}</span>` : ''}
    </div>
    ${dica ? `<div class="dica" style="color:${c().textMuted}">${dica}</div>` : ''}
  </div>`;
}

function seletor(rotulo, valor, { acao = '' } = {}) {
  return `<div class="campo">
    <div class="rotulo" style="color:${c().textMuted}">${rotulo}</div>
    <button class="campo-caixa seletor" ${acao ? `data-ir="${acao}"` : ''}
      style="background:${c().surfaceSunken};border-color:${c().line}">
      <span style="color:${c().text}">${valor}</span>${UI.baixo(c().textMuted)}
    </button>
  </div>`;
}

function segmentado(opcoes, ativo, grupo) {
  return `<div class="seg" style="background:${c().surfaceSunken};border-color:${c().line}">
    ${opcoes.map(([id, txt]) => `
      <button class="seg-item ${id === ativo ? 'on' : ''}" data-seg="${grupo}" data-val="${id}"
        style="${id === ativo ? `background:${c().surface};color:${c().text};box-shadow:0 1px 3px rgba(0,0,0,.14)` : `color:${c().textMuted}`}">
        ${txt}</button>`).join('')}
  </div>`;
}

function secao(titulo, acao = '') {
  return `<div class="secao"><span class="rotulo" style="color:${c().textMuted}">${titulo}</span>${acao}</div>`;
}

function linhaHistorico(item, ultimo, clicavel = false) {
  const detalhes = [item.data, item.km, item.extra].filter(Boolean).join('  ·  ');
  return `<div class="linha ${clicavel ? 'tocavel' : ''}" ${clicavel ? 'data-ir="detalhe"' : ''}
    style="border-bottom:${ultimo ? 'none' : `1px solid ${c().line}`}">
    ${ICONES[item.tipo](c().brand, 22)}
    <div class="linha-meio">
      <div class="linha-t" style="color:${c().text}">${item.nome}</div>
      <div class="linha-m mono" style="color:${c().textMuted}">${detalhes}</div>
      ${item.oficina ? `<div class="linha-o" style="color:${c().textMuted}">${item.oficina}</div>` : ''}
    </div>
    <div class="linha-v mono" style="color:${c().text}">${item.valor}</div>
  </div>`;
}

function cartaoVeiculo(v) {
  const l = v.lembrete;
  return cartao(`
    <div class="v-topo">
      <div class="miniatura" style="background:${c().surfaceSunken};border-color:${c().line}">
        ${glifo(v.tipo, c().textMuted, 28)}
      </div>
      <div class="v-id">
        <div class="v-nome" style="color:${c().text}">${v.apelido}</div>
        <div class="v-sub" style="color:${c().textMuted}">${v.marca} ${v.modelo} · ${v.ano}</div>
        <div class="v-placa mono" style="color:${c().textMuted}">${v.placa}</div>
      </div>
      ${chip(l.status)}
    </div>
    <div class="v-odo" style="border-top:1px solid ${c().line}">
      <span class="rotulo" style="color:${c().textMuted}">Odômetro</span>
      <span class="medida lg mono" style="color:${c().text}">${v.km.toLocaleString('pt-BR')} km</span>
    </div>
    <div class="v-lembrete">
      <div class="v-lembrete-linha">
        <span class="linha-t" style="color:${c().text}">${l.nome}</span>
        <span class="v-restante" style="color:${corStatus(l.status)}">${l.texto}</span>
      </div>
      ${faixa(l.p, l.status, l.de, l.ate)}
    </div>
  `, { accent: l.status === 'vencido' ? c().late : '', acao: 'painel' });
}

/* ========================================================================== */
/* Telas                                                                       */
/* ========================================================================== */

const TELAS = {};

TELAS.garagem = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Minha garagem', '2 veículos', {
    acao: `<button class="icone-btn" data-ir="ajustes" aria-label="Ajustes">${UI.engrenagem(c().text)}</button>`,
  })}
  ${cartao(`<div class="resumo">
      <div class="resumo-txt">
        <div class="linha-t" style="color:${c().text}">2 serviços vencidos</div>
        <div class="dica" style="color:${c().textMuted}">E mais 3 próximos do prazo.</div>
      </div>${UI.avancar(c().textMuted)}
    </div>`, { accent: c().late, acao: 'alertas' })}
  <div class="pilha">${VEICULOS.map(cartaoVeiculo).join('')}</div>
  ${botao('Cadastrar outro veículo', { variante: 'secondary', acao: 'novoVeiculo' })}
`});

TELAS.alertas = () => {
  const visiveis = estado.filtroAlertas === 'pendentes'
    ? ALERTAS.filter((a) => a.status !== 'em-dia') : ALERTAS;
  const grupos = [
    ['vencido', 'Vencidos'], ['atencao', 'Chegando no prazo'], ['em-dia', 'Em dia'],
  ].map(([s, t]) => [t, visiveis.filter((a) => a.status === s)]).filter(([, l]) => l.length);

  return { tab: 'alertas', html: `
  ${cabecalho('Alertas', '5 serviços pendentes')}
  ${segmentado([['pendentes', 'Pendentes (5)'], ['todos', 'Todos (7)']], estado.filtroAlertas, 'filtroAlertas')}
  ${grupos.map(([titulo, itens]) => `
    <div class="grupo">
      ${secao(`${titulo} · ${itens.length}`)}
      <div class="pilha">
        ${itens.map((a) => cartao(`
          <div class="a-topo">
            <div class="a-icone" style="background:${c().surfaceSunken};border-color:${c().line}">
              ${ICONES[a.tipo](corStatus(a.status), 22)}
            </div>
            <div class="a-txt">
              <div class="linha-t" style="color:${c().text}">${a.nome}</div>
              <div class="dica" style="color:${c().textMuted}">${a.veiculo}</div>
            </div>
            ${chip(a.status, a.texto)}
          </div>
          ${faixa(a.p, a.status, a.de, a.ate)}
          ${botao('Registrar como feito', { variante: a.status === 'vencido' ? 'primary' : 'secondary', acao: 'novaManutencao' })}
        `, { accent: a.status === 'vencido' ? c().late : '' })).join('')}
      </div>
    </div>`).join('')}
`};
};

TELAS.gastos = () => {
  const barras = [
    ['jun', 22], ['jul', 46], ['ago', 28], ['set', 54], ['out', 78], ['nov', 100],
  ];
  const categorias = [
    ['abastecimento', 'Abastecimento', '45%', '1.903,50', 1],
    ['oleo', 'Troca de óleo e filtro', '26%', '1.099,80', 0.8],
    ['freios', 'Freios', '16%', '676,80', 0.62],
    ['pneus', 'Pneus', '8%', '338,40', 0.46],
    ['filtros', 'Filtros', '5%', '211,50', 0.34],
  ];

  return { tab: 'gastos', html: `
  ${cabecalho('Gastos', 'Todos os veículos')}
  <div class="faixa-chips">
    ${['Todos', 'Gol do trabalho', 'Fan do dia a dia'].map((n, i) => `
      <button class="chip-sel ${i === 0 ? 'on' : ''}"
        style="${i === 0 ? `background:${c().brand};color:${c().textOnBrand};border-color:${c().brand}` : `background:${c().surface};color:${c().text};border-color:${c().line}`}">
        ${i > 0 ? glifo(i === 1 ? 'carro' : 'moto', i === 0 ? c().textOnBrand : c().textMuted, 18) : ''}${n}</button>`).join('')}
  </div>
  ${segmentado([['mes', 'Mês'], ['ano', 'Ano'], ['doze', '12 meses']], estado.periodoGastos, 'periodoGastos')}
  ${cartao(`
    <div class="rotulo" style="color:${c().textMuted}">Total no período</div>
    <div class="medida xl mono" style="color:${c().text}">R$ 4.230,00</div>
    <div class="dica" style="color:${c().textMuted}">19 registros · R$ 705,00 por mês</div>
    <div class="bloco">
      ${secao('Evolução mensal')}
      <div class="barras">
        ${barras.map(([, h], i) => `<div class="col">
          ${i === barras.length - 1 ? `<span class="mono barra-rot" style="color:${c().textMuted}">1.450,00</span>` : ''}
          <div class="barra" style="height:${h}%;background:${c().brand};opacity:${i === barras.length - 1 ? 1 : 0.65}"></div>
        </div>`).join('')}
      </div>
      <div class="barra-eixo" style="border-top:1px solid ${c().line}">
        ${barras.map(([m]) => `<span class="mono" style="color:${c().textMuted}">${m}</span>`).join('')}
      </div>
    </div>
  `)}
  <div class="duo">
    ${leitura('Consumo médio', '12,4 km/L', 'Entre abastecimentos')}
    ${leitura('Custo por km', 'R$ 0,42', 'No período')}
  </div>
  ${cartao(`
    ${secao('Por categoria')}
    <div class="empilhada" style="background:${c().surfaceSunken};border-color:${c().line}">
      ${categorias.map(([, , pct, , op]) => `<div style="flex:${parseInt(pct)};background:${c().brand};opacity:${op}"></div>`).join('')}
    </div>
    <div class="bloco">
      ${categorias.map(([tipo, nome, pct, val, op], i) => `
        <div class="cat" style="border-bottom:${i === categorias.length - 1 ? 'none' : `1px solid ${c().line}`}">
          <span class="amostra" style="background:${c().brand};opacity:${op}"></span>
          ${ICONES[tipo](c().textMuted, 18)}
          <span class="cat-nome" style="color:${c().text}">${nome}</span>
          <span class="mono cat-pct" style="color:${c().textMuted}">${pct}</span>
          <span class="mono cat-val" style="color:${c().text}">${val}</span>
        </div>`).join('')}
    </div>
  `)}
`};
};

TELAS.painel = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Gol do trabalho', 'Volkswagen Gol 1.0 Flex · 2018', { voltar: true })}
  ${cartao(`
    <div class="capa" style="background:${c().surfaceSunken}">${glifo('carro', c().line, 56)}</div>
    <div class="capa-corpo">
      <div class="v-odo-topo">
        <span class="mono" style="color:${c().textMuted};font-size:13px;letter-spacing:.4px">BRA 2E19</span>
        ${chip('vencido')}
      </div>
      <div class="odo-linha">
        <div>
          <div class="rotulo" style="color:${c().textMuted}">Odômetro</div>
          <div class="medida xl mono" style="color:${c().text}">114.500 km</div>
        </div>
        ${botao('Atualizar', { variante: 'secondary', icone: UI.velocimetro(c().brand), acao: 'atualizarKm' })}
      </div>
      <div class="bloco">
        <div class="v-lembrete-linha">
          <span class="linha-t" style="color:${c().text}">Filtro de cabine</span>
          <span class="v-restante" style="color:${c().late}">Venceu há 300 km</span>
        </div>
        ${faixa(1.02, 'vencido', '99.200 km', '114.200 km')}
      </div>
    </div>
  `, { flush: true })}
  <div class="duo">
    ${leitura('Gasto no mês', 'R$ 165,00', '1 registro')}
    ${leitura('Total acumulado', 'R$ 1.377,00', '7 serviços')}
  </div>
  ${segmentado([['historico', 'Histórico'], ['alertas', 'Alertas (4)'], ['gastos', 'Gastos']], estado.abaPainel, 'abaPainel')}
  ${abaDoPainel()}
  ${botao('Registrar manutenção', { icone: UI.mais(c().textOnBrand), acao: 'novaManutencao' })}
  ${botao('Remover veículo', { variante: 'ghost', destrutivo: true })}
`});

function abaDoPainel() {
  if (estado.abaPainel === 'alertas') {
    return `<div class="pilha">${ALERTAS.filter((a) => a.veiculo === 'Gol do trabalho').map((a) => cartao(`
      <div class="a-topo">
        <div class="a-icone" style="background:${c().surfaceSunken};border-color:${c().line}">
          ${ICONES[a.tipo](corStatus(a.status), 22)}
        </div>
        <div class="a-txt">
          <div class="linha-t" style="color:${c().text}">${a.nome}</div>
          <div class="dica" style="color:${c().textMuted}">${a.veiculo}</div>
        </div>
        ${chip(a.status, a.texto)}
      </div>
      ${faixa(a.p, a.status, a.de, a.ate)}
      ${botao('Registrar como feito', { variante: a.status === 'vencido' ? 'primary' : 'secondary', acao: 'novaManutencao' })}
    `, { accent: a.status === 'vencido' ? c().late : '' })).join('')}</div>`;
  }

  if (estado.abaPainel === 'gastos') {
    return cartao(`
      <div class="rotulo" style="color:${c().textMuted}">Total gasto com este veículo</div>
      <div class="medida xl mono" style="color:${c().text}">R$ 1.377,00</div>
      <div class="bloco">
        ${secao('Por categoria')}
        ${[['abastecimento', 'Abastecimento', '38%', '517,00', 1],
           ['oleo', 'Troca de óleo e filtro', '20%', '280,00', 0.8],
           ['freios', 'Freios', '25%', '340,00', 0.62],
           ['pneus', 'Pneus', '9%', '120,00', 0.46],
           ['filtros', 'Filtros', '9%', '120,00', 0.34]]
          .map(([tipo, nome, pct, val, op], i, arr) => `
          <div class="cat" style="border-bottom:${i === arr.length - 1 ? 'none' : `1px solid ${c().line}`}">
            <span class="amostra" style="background:${c().brand};opacity:${op}"></span>
            ${ICONES[tipo](c().textMuted, 18)}
            <span class="cat-nome" style="color:${c().text}">${nome}</span>
            <span class="mono cat-pct" style="color:${c().textMuted}">${pct}</span>
            <span class="mono cat-val" style="color:${c().text}">${val}</span>
          </div>`).join('')}
      </div>
    `);
  }

  const recentes = HISTORICO.slice(0, 5);
  return cartao(`
    <div class="card-head">
      ${secao('Últimos registros', `<button class="link" data-ir="historico" style="color:${c().textMuted}">Ver todos (7)</button>`)}
    </div>
    <div class="card-corpo">
      ${recentes.map((h, i) => linhaHistorico(h, i === recentes.length - 1)).join('')}
    </div>
  `, { flush: true });
}

TELAS.historico = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Histórico', 'Gol do trabalho · 7 registros', { voltar: true })}
  ${segmentado([['tudo', 'Tudo'], ['ano', 'Este ano'], ['doze', '12 meses']], 'tudo', 'periodoHistorico')}
  <div class="faixa-chips">
    ${['Óleo e filtro', 'Freios', 'Pneus', 'Filtros', 'Abastecimento'].map((n) => `
      <button class="chip-sel" style="background:${c().surface};color:${c().text};border-color:${c().line}">${n}</button>`).join('')}
  </div>
  ${cartao(`
    <div class="card-head">
      ${secao('7 registros', `<span class="mono" style="color:${c().text};font-size:16px;font-weight:600">R$ 1.377,00</span>`)}
    </div>
    <div class="card-corpo">
      ${HISTORICO.map((h, i) => linhaHistorico(h, i === HISTORICO.length - 1, true)).join('')}
    </div>
  `, { flush: true })}
`});

TELAS.novoVeiculo = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Novo veículo', '', { voltar: true })}
  ${segmentado([['carro', 'Carro'], ['moto', 'Moto']], 'carro', 'tipoVeiculo')}
  <div class="foto-slot" style="background:${c().surfaceSunken};border-color:${c().line}">
    ${glifo('carro', c().textMuted, 40)}
    <span class="dica" style="color:${c().textMuted}">Adicionar foto (opcional)</span>
  </div>
  <div class="form">
    ${campo('Apelido', 'Gol do trabalho', { dica: 'Como você chama esse veículo no dia a dia.' })}
    ${seletor('Marca', 'Volkswagen', { acao: 'folhaMarca' })}
    ${seletor('Modelo', 'Gol 1.0 Flex')}
    ${cartao(`
      <div class="rotulo" style="color:${c().textMuted}">Valor de referência FIPE</div>
      <div class="medida lg mono" style="color:${c().text}">R$ 38.742,00</div>
      <div class="dica" style="color:${c().textMuted}">Tabela de novembro de 2026</div>
    `)}
    <div class="duo">
      ${campo('Ano', '2018', { mono: true })}
      ${campo('Placa', 'BRA1D23', { mono: true })}
    </div>
    ${seletor('Combustível', 'Flex')}
    ${campo('Quilometragem atual', '85000', { mono: true, sufixo: 'km', dica: 'Pode deixar em branco e atualizar depois.' })}
  </div>
  ${botao('Salvar veículo', { acao: 'garagem' })}
  ${botao('Cancelar', { variante: 'ghost', acao: 'garagem' })}
`});

TELAS.novaManutencao = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Registrar manutenção', '', { voltar: true })}
  <div class="campo">
    <div class="rotulo" style="color:${c().textMuted}">Veículo</div>
    <div class="faixa-chips">
      ${VEICULOS.map((v, i) => `<button class="chip-sel ${i === 0 ? 'on' : ''}"
        style="${i === 0 ? `background:${c().brand};color:${c().textOnBrand};border-color:${c().brand}` : `background:${c().surface};color:${c().text};border-color:${c().line}`}">
        ${glifo(v.tipo, i === 0 ? c().textOnBrand : c().textMuted, 18)}${v.apelido}</button>`).join('')}
    </div>
  </div>
  <div class="campo">
    <div class="rotulo" style="color:${c().textMuted}">Tipo de serviço</div>
    <div class="grade">
      ${TIPOS.map(([id, nome]) => {
        const on = id === estado.tipoSelecionado;
        return `<button class="grade-item" data-tipo="${id}"
          style="border-color:${on ? c().brand : c().line};border-width:${on ? 2 : 1}px;background:${on ? c().brandSoft : c().surface}">
          ${ICONES[id](on ? c().brand : c().textMuted, 26)}
          <span style="color:${on ? c().brand : c().text}">${nome}</span>
        </button>`;
      }).join('')}
    </div>
  </div>
  <div class="form">
    <div class="duo">
      ${campo('Data', '2026-11-08', { mono: true, dica: '08/11/2026' })}
      ${campo('Quilometragem', '114.500', { mono: true, sufixo: 'km', placeholder: true })}
    </div>
    <div class="duo">
      ${campo('Valor pago', '280,00', { mono: true, sufixo: 'R$' })}
      <div style="flex:1"></div>
    </div>
    ${campo('Oficina ou posto', 'Oficina do Zé')}
    ${campo('Observações', 'Óleo sintético 5W40 e filtro original', { area: true })}
  </div>
  ${cartao(`
    ${secao('Nota fiscal')}
    ${botao('Anexar foto da nota', { variante: 'secondary', icone: UI.camera(c().brand) })}
  `)}
  ${cartao(`
    ${secao('Próxima troca')}
    <p class="dica" style="color:${c().textMuted};margin-bottom:12px">
      Sugerimos o intervalo padrão deste serviço. Ajuste se a sua oficina indicou outro, ou apague para não criar lembrete.</p>
    <div class="duo">
      ${campo('Avisar em', '10000', { mono: true, sufixo: 'km' })}
      ${campo('Ou em', '12', { mono: true, sufixo: 'meses' })}
    </div>
  `)}
  ${botao('Salvar manutenção', { acao: 'painel' })}
  ${botao('Cancelar', { variante: 'ghost', acao: 'painel' })}
`});

TELAS.editarManutencao = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Editar manutenção', 'Troca de óleo e filtro', { voltar: true })}
  <p class="dica" style="color:${c().textMuted};margin-bottom:16px">Gol do trabalho</p>
  <div class="campo">
    <div class="rotulo" style="color:${c().textMuted}">Tipo de serviço</div>
    <div class="grade">
      ${TIPOS.map(([id, nome]) => {
        const on = id === 'oleo';
        return `<button class="grade-item"
          style="border-color:${on ? c().brand : c().line};border-width:${on ? 2 : 1}px;background:${on ? c().brandSoft : c().surface}">
          ${ICONES[id](on ? c().brand : c().textMuted, 26)}
          <span style="color:${on ? c().brand : c().text}">${nome}</span>
        </button>`;
      }).join('')}
    </div>
  </div>
  <div class="form">
    <div class="duo">
      ${campo('Data', '2026-04-08', { mono: true, dica: '08/04/2026' })}
      ${campo('Quilometragem', '105.000', { mono: true, sufixo: 'km' })}
    </div>
    <div class="duo">
      ${campo('Valor pago', '280,00', { mono: true, sufixo: 'R$' })}
      <div style="flex:1"></div>
    </div>
    ${campo('Oficina ou posto', 'AutoCar Express')}
  </div>
  ${botao('Salvar alterações', { acao: 'historico' })}
  ${botao('Cancelar', { variante: 'ghost', acao: 'historico' })}
`});

TELAS.aparencia = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Aparência', `Usando ${TEMAS[estado.tema].nome}`, { voltar: true })}
  ${cartao(`
    ${secao('Prévia')}
    <div class="a-topo" style="margin-bottom:12px">
      <div class="a-txt">
        <div class="linha-t" style="color:${c().text}">Troca de óleo e filtro</div>
        <div class="dica" style="color:${c().textMuted}">Gol do trabalho</div>
      </div>
      ${chip('atencao', 'Faltam 900 km')}
    </div>
    ${faixa(0.91, 'atencao', '105.000 km', '115.000 km')}
  `)}
  <div class="bloco">
    ${secao('Tema')}
    <div class="opcoes">
      <button class="opcao" data-tema="system"
        style="border-color:${c().line};background:${c().surface}">
        <span class="amostra-tema" style="border-color:${c().lineStrong};overflow:hidden;display:flex">
          <span style="flex:1;background:#F2F3F0"></span><span style="flex:1;background:#101513"></span>
        </span>
        <span class="opcao-txt">
          <span class="linha-t" style="color:${c().text}">Seguir o sistema</span>
          <span class="dica" style="color:${c().textMuted}">Claro de dia, escuro à noite.</span>
        </span>
        <span class="radio" style="border-color:${c().lineStrong}"></span>
      </button>
      ${Object.entries(TEMAS).map(([id, t]) => {
        const on = id === estado.tema;
        return `<button class="opcao" data-tema="${id}"
          style="border-color:${on ? c().brand : c().line};border-width:${on ? 2 : 1}px;background:${on ? c().brandSoft : c().surface}">
          <span class="amostra-tema" style="background:${t.cores.background};border-color:${c().lineStrong}">
            <span class="amostra-faixa" style="background:${t.cores.surface}"></span>
            <span class="amostra-ponto" style="background:${t.cores.brand}"></span>
          </span>
          <span class="opcao-txt">
            <span class="linha-t" style="color:${c().text}">${t.nome}</span>
            <span class="dica" style="color:${c().textMuted}">${t.descricao}</span>
          </span>
          <span class="radio" style="border-color:${on ? c().brand : c().lineStrong};background:${on ? c().brand : 'transparent'}">
            ${on ? `<span class="radio-i" style="background:${c().surface}"></span>` : ''}
          </span>
        </button>`;
      }).join('')}
    </div>
  </div>
  <p class="dica" style="color:${c().textMuted};margin-top:16px">
    A escolha fica salva no aparelho e vale na próxima vez que você abrir o app.</p>
`});

TELAS.ajustes = () => ({
  tab: 'veiculos',
  html: `
  ${cabecalho('Ajustes', '', { voltar: true })}
  ${secao('Aparência')}
  ${cartao(`
    <button class="nav-linha" data-ir="aparencia">
      <span class="opcao-txt">
        <span class="linha-t" style="color:${c().text}">Tema</span>
        <span class="dica" style="color:${c().textMuted}">Usando ${TEMAS[estado.tema].nome}</span>
      </span>${UI.avancar(c().textMuted)}
    </button>
  `, { flush: true })}
  ${secao('Notificações')}
  ${cartao(`
    <div class="switch-linha">
      <div class="opcao-txt">
        <span class="linha-t" style="color:${c().text}">Avisos de manutenção</span>
        <span class="dica" style="color:${c().textMuted}">4 avisos agendados, 7 dias antes do prazo.</span>
      </div>
      <span class="switch on" style="background:${c().brand}"><span style="background:${c().surface}"></span></span>
    </div>
    <div class="divisor" style="background:${c().line}"></div>
    <p class="dica" style="color:${c().textMuted}">
      Serviços que vencem só por quilometragem não têm data para agendar. Esses aparecem na aba Alertas assim que o odômetro chega perto do limite.</p>
    ${botao('Enviar aviso de teste', { variante: 'secondary' })}
  `)}
  ${secao('Dados')}
  ${cartao(`
    <div class="numeros">
      <div><div class="medida lg mono" style="color:${c().text}">2</div><div class="dica" style="color:${c().textMuted}">veículos</div></div>
      <div><div class="medida lg mono" style="color:${c().text}">19</div><div class="dica" style="color:${c().textMuted}">registros</div></div>
      <div><div class="medida lg mono" style="color:${c().text}">7</div><div class="dica" style="color:${c().textMuted}">lembretes</div></div>
    </div>
    <p class="dica" style="color:${c().textMuted};margin-top:12px">
      Tudo fica guardado neste aparelho. Nada é enviado para servidor, exceto a consulta pública da tabela FIPE no cadastro de veículos.</p>
    ${botao('Apagar todos os dados', { variante: 'ghost', destrutivo: true })}
  `)}
  <div class="rodape">
    ${marca(c().textMuted, c().brand, 30)}
    <span class="dica" style="color:${c().textMuted}">CarroEmDia 1.0</span>
    <span class="dica" style="color:${c().textMuted}">Engenharia de Software · UCB</span>
  </div>
`});

/* ========================================================================== */
/* Folhas (modais)                                                             */
/* ========================================================================== */

const FOLHAS = {
  folhaMarca: () => `
    <div class="folha-topo">
      <h2 style="color:${c().text}">Marca</h2>
      <button class="icone-btn" data-fechar aria-label="Fechar">${UI.fechar(c().textMuted)}</button>
    </div>
    <div class="busca" style="background:${c().surfaceSunken};border-color:${c().line}">
      ${UI.busca(c().textMuted)}<span style="color:${c().textMuted}">Buscar</span>
    </div>
    <div class="folha-lista">
      ${['Chevrolet', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Nissan', 'Renault', 'Toyota', 'Volkswagen']
        .map((m) => `<button class="folha-item" style="border-bottom:1px solid ${c().line}">
          <span style="color:${m === 'Volkswagen' ? c().brand : c().text};font-weight:${m === 'Volkswagen' ? 600 : 400}">${m}</span>
          ${m === 'Volkswagen' ? UI.check(c().brand) : ''}</button>`).join('')}
    </div>`,

  atualizarKm: () => `
    <div class="folha-pad">
      <h2 style="color:${c().text}">Atualizar quilometragem</h2>
      <p class="dica" style="color:${c().textMuted};margin-top:2px">Gol do trabalho está com 114.500 km.</p>
      ${campo('Nova quilometragem', '115.000', { mono: true, sufixo: 'km', placeholder: true })}
      <p class="dica" style="color:${c().textMuted};margin-top:8px">Os lembretes são recalculados com o novo valor.</p>
      <div style="margin-top:16px;display:grid;gap:8px">
        ${botao('Salvar', { acao: 'painel' })}
        ${botao('Cancelar', { variante: 'ghost', acao: '__fechar' })}
      </div>
    </div>`,

  detalhe: () => `
    <div class="folha-pad">
      <div class="folha-topo" style="padding:0">
        <div class="a-icone" style="background:${c().surfaceSunken};border-color:${c().line}">
          ${ICONES.oleo(c().brand, 24)}
        </div>
        <h2 style="color:${c().text};flex:1">Troca de óleo e filtro</h2>
        <button class="icone-btn" data-fechar aria-label="Fechar">${UI.fechar(c().textMuted)}</button>
      </div>
      <div class="bloco">
        ${[['Data', '08/04/2026'], ['Quilometragem', '105.000 km'], ['Valor pago', 'R$ 280,00'],
           ['Oficina', 'AutoCar Express'], ['Próxima em', '10.000 km'], ['Ou em', '12 meses']]
          .map(([k, v], i) => `
          <div class="detalhe-linha" style="border-top:${i === 0 ? 'none' : `1px solid ${c().line}`}">
            <span style="color:${c().textMuted}">${k}</span>
            <span class="mono" style="color:${c().text}">${v}</span>
          </div>`).join('')}
      </div>
      <div class="bloco">
        <div class="rotulo" style="color:${c().textMuted};margin-bottom:4px">Observações</div>
        <p style="color:${c().text};font-size:15px">Óleo sintético 5W40 e filtro de óleo original.</p>
      </div>
      <div style="margin-top:20px;display:grid;gap:8px">
        ${botao('Editar registro', { variante: 'secondary', icone: UI.lapis(c().brand), acao: 'editarManutencao' })}
        ${botao('Excluir registro', { variante: 'ghost', destrutivo: true, acao: '__fechar' })}
      </div>
    </div>`,
};

/* ========================================================================== */
/* Barra de abas                                                               */
/* ========================================================================== */

function abas(ativa) {
  const itens = [
    ['veiculos', 'Veículos', UI.carro, 'garagem'],
    ['alertas', 'Alertas', UI.sino, 'alertas'],
    ['gastos', 'Gastos', UI.grafico, 'gastos'],
  ];
  return `<nav class="abas" style="background:${c().surfaceRaised};border-top:1px solid ${c().line}">
    ${itens.map(([id, nome, icone, destino]) => {
      const on = id === ativa;
      const cor = on ? c().brand : c().textMuted;
      return `<button class="aba" data-ir="${destino}" aria-current="${on}">
        <span class="aba-ic">${icone(cor, 24)}${id === 'alertas' ? `
          <span class="selo" style="background:${c().late};border-color:${c().surfaceRaised};color:#fff">5</span>` : ''}</span>
        <span style="color:${cor}">${nome}</span>
      </button>`;
    }).join('')}
  </nav>`;
}

/* ========================================================================== */
/* Render                                                                      */
/* ========================================================================== */

/** Telas que são modais sobre a anterior e não aparecem no seletor lateral. */
const TELAS_DE_PILHA = new Set([
  'painel', 'historico', 'novoVeiculo', 'novaManutencao',
  'editarManutencao', 'aparencia', 'ajustes',
]);

function render() {
  const tema = TEMAS[estado.tema];
  const cor = tema.cores;
  const tela = TELAS[estado.tela]();

  // Variáveis de tema no documento, para o CSS do chrome acompanhar.
  const raiz = document.documentElement;
  Object.entries(cor).forEach(([k, v]) => raiz.style.setProperty(`--${k}`, v));
  raiz.style.setProperty('--esquema', tema.esquema);

  document.getElementById('tela').innerHTML = `
    <div class="status" style="color:${cor.text}">
      <span class="mono">9:41</span>
      <span class="status-dir">
        <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
          ${[0, 1, 2, 3].map((i) => `<rect x="${i * 4.4}" y="${8 - i * 2.4}" width="3" height="${3 + i * 2.4}" rx=".6" fill="${cor.text}"/>`).join('')}
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true">
          <path d="M8 9.5 1.8 3.8a8.8 8.8 0 0 1 12.4 0Z" fill="${cor.text}"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true">
          <rect x=".6" y=".6" width="20" height="10.8" rx="3" fill="none" stroke="${cor.text}" stroke-opacity=".4"/>
          <rect x="2.2" y="2.2" width="14" height="7.6" rx="1.6" fill="${cor.text}"/>
          <path d="M22.4 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="${cor.text}" fill-opacity=".4"/>
        </svg>
      </span>
    </div>
    <main class="corpo" style="background:${cor.background}">${tela.html}</main>
    ${abas(tela.tab)}
    ${estado.folha ? `
      <div class="scrim" style="background:${cor.scrim}" data-fechar></div>
      <div class="folha" style="background:${cor.surfaceRaised}">
        <div class="puxador" style="background:${cor.line}"></div>
        ${FOLHAS[estado.folha]()}
      </div>` : ''}
    <div class="indicador" style="background:${cor.text}"></div>
  `;

  document.getElementById('moldura').style.background = cor.background;
  renderNavegacao();
  ligarEventos();
}

const NAV = [
  ['garagem', 'Garagem'], ['painel', 'Painel do veículo'], ['historico', 'Histórico'],
  ['alertas', 'Alertas'], ['gastos', 'Gastos'], ['novoVeiculo', 'Cadastrar veículo'],
  ['novaManutencao', 'Registrar manutenção'], ['editarManutencao', 'Editar manutenção'],
  ['aparencia', 'Aparência'], ['ajustes', 'Ajustes'],
];

function renderNavegacao() {
  document.getElementById('nav-telas').innerHTML = NAV.map(
    ([id, nome], i) => `<button class="nav-btn ${id === estado.tela ? 'on' : ''}" data-ir="${id}">
      <span class="nav-num">${String(i + 1).padStart(2, '0')}</span>${nome}</button>`,
  ).join('');

  document.getElementById('nav-temas').innerHTML = Object.entries(TEMAS).map(
    ([id, t]) => `<button class="tema-btn ${id === estado.tema ? 'on' : ''}" data-tema="${id}">
      <span class="tema-amostra" style="background:${t.cores.background};border-color:${t.cores.lineStrong}">
        <span style="background:${t.cores.brand}"></span>
      </span>${t.nome}</button>`,
  ).join('');
}

/* ========================================================================== */
/* Eventos                                                                     */
/* ========================================================================== */

/** De onde cada tela de pilha voltou, para a seta funcionar. */
function voltar() {
  estado.tela = estado.historico.pop() || 'garagem';
  render();
}

function irPara(destino) {
  if (destino === '__fechar') {
    estado.folha = null;
    render();
    return;
  }
  if (FOLHAS[destino]) {
    estado.folha = destino;
    render();
    return;
  }
  if (!TELAS[destino]) return;

  estado.folha = null;
  if (TELAS_DE_PILHA.has(destino) && estado.tela !== destino) {
    estado.historico.push(estado.tela);
  }
  if (!TELAS_DE_PILHA.has(destino)) {
    estado.historico = [];
  }
  estado.tela = destino;
  render();
}

function ligarEventos() {
  const tela = document.getElementById('tela');

  tela.querySelectorAll('[data-ir]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      irPara(el.dataset.ir);
    });
  });

  tela.querySelectorAll('[data-voltar]').forEach((el) =>
    el.addEventListener('click', voltar));

  tela.querySelectorAll('[data-fechar]').forEach((el) =>
    el.addEventListener('click', () => { estado.folha = null; render(); }));

  tela.querySelectorAll('[data-seg]').forEach((el) =>
    el.addEventListener('click', () => {
      estado[el.dataset.seg] = el.dataset.val;
      render();
    }));

  tela.querySelectorAll('[data-tipo]').forEach((el) =>
    el.addEventListener('click', () => {
      estado.tipoSelecionado = el.dataset.tipo;
      render();
    }));

  tela.querySelectorAll('[data-tema]').forEach((el) =>
    el.addEventListener('click', () => {
      // "Seguir o sistema" vira o tema claro padrão nesta maquete.
      estado.tema = el.dataset.tema === 'system' ? 'oficina' : el.dataset.tema;
      render();
    }));
}

function ligarChrome() {
  document.getElementById('nav-telas').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ir]');
    if (btn) {
      estado.historico = [];
      estado.folha = null;
      estado.tela = btn.dataset.ir;
      render();
    }
  });

  document.getElementById('nav-temas').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tema]');
    if (btn) {
      estado.tema = btn.dataset.tema;
      render();
    }
  });

  // Setas do teclado percorrem as telas, útil ao apresentar.
  document.addEventListener('keydown', (e) => {
    const i = NAV.findIndex(([id]) => id === estado.tela);
    if (e.key === 'ArrowRight' && i < NAV.length - 1) {
      estado.tela = NAV[i + 1][0]; estado.folha = null; render();
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      estado.tela = NAV[i - 1][0]; estado.folha = null; render();
    }
    if (e.key === 'Escape' && estado.folha) {
      estado.folha = null; render();
    }
  });
}

ligarChrome();
render();
