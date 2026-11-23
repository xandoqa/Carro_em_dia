/**
 * Grafico de barras da evolucao mensal.
 *
 * Desenhado com View em vez de biblioteca de graficos: sao poucas barras, e
 * uma dependencia de grafico custaria centenas de kB no bundle para fazer o
 * que cabe em quarenta linhas.
 *
 * Escolhas que vieram do dado, nao da estetica:
 * - meses sem gasto aparecem como um traco na linha de base, nao somem, para
 *   a distancia entre as barras continuar significando tempo;
 * - o maior valor do periodo fica rotulado, porque e o numero que o usuario
 *   procura;
 * - a altura e proporcional ao maior valor do periodo, nunca a um teto fixo.
 */

import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion, FadeIn } from 'react-native-reanimated';

import type { GastoPorMes } from '../../domain/models';
import { useTheme } from '../../theme/ThemeProvider';
import { formatAmount } from '../../utils/format';
import { Txt } from '../base/Text';

export interface BarChartProps {
  data: GastoPorMes[];
  /** Altura da area das barras. */
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  if (data.length === 0) {
    return (
      <Txt variant="bodySM" tone="muted">
        Sem gastos registrados no período.
      </Txt>
    );
  }

  const maior = Math.max(...data.map((d) => d.total));
  const indiceMaior = data.findIndex((d) => d.total === maior);

  // Espaço reservado no topo para o valor da barra mais alta, que fica
  // acima dela e não pode ser cortado pela borda da área.
  const alturaUtil = height - ESPACO_ROTULO;

  // Com doze meses, cada coluna tem uns 19 px e "dez" precisa de 25: o rótulo
  // virava "d…". Acima de seis colunas fica só a inicial, a convenção dos
  // gráficos compactos. O nome completo continua na descrição acessível.
  const compacto = data.length > 6;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={descrever(data)}
    >
      <View style={[styles.area, { height }]}>
        {data.map((ponto, i) => {
          // Mes sem gasto vira um traco fino na base em vez de nada.
          const fracao = maior > 0 ? ponto.total / maior : 0;
          const alturaBarra = Math.max(
            fracao * alturaUtil,
            ponto.total > 0 ? 4 : 2,
          );
          const destaque = i === indiceMaior && maior > 0;

          return (
            <View key={ponto.mes} style={styles.coluna}>
              {destaque ? (
                // O valor é mais largo que a coluna. O posicionamento fica num
                // contêiner, e não no texto: no navegador, texto de uma linha
                // ganha max-width: 100% da coluna e era cortado em "3…".
                // Ancorado na borda quando a barra é a primeira ou a última,
                // para não sair do cartão.
                <View
                  pointerEvents="none"
                  style={[
                    styles.rotuloTopo,
                    { bottom: alturaBarra + 4 },
                    i === 0
                      ? styles.rotuloInicio
                      : i === data.length - 1
                        ? styles.rotuloFim
                        : styles.rotuloMeio,
                  ]}
                >
                  <Txt
                    variant="meterSM"
                    tone="muted"
                    style={styles.rotuloTexto}
                    numberOfLines={1}
                  >
                    {formatAmount(ponto.total)}
                  </Txt>
                </View>
              ) : null}

              {/* A animação de entrada fica num invólucro e a opacidade na
                  barra: no mesmo elemento, o Reanimated avisa que a entrada
                  pode sobrescrever a opacidade — aviso amarelo na tela do
                  celular durante o uso. */}
              <Animated.View
                entering={
                  reduced ? undefined : FadeIn.delay(i * 40).duration(260)
                }
              >
                <View
                  style={[
                    styles.barra,
                    {
                      height: alturaBarra,
                      backgroundColor:
                        ponto.total > 0
                          ? theme.colors.brand
                          : theme.colors.line,
                      opacity: ponto.total === 0 ? 1 : destaque ? 1 : 0.65,
                      borderTopLeftRadius: theme.radius.readout,
                      borderTopRightRadius: theme.radius.readout,
                    },
                  ]}
                />
              </Animated.View>
            </View>
          );
        })}
      </View>

      <View
        style={[
          styles.eixo,
          { borderTopColor: theme.colors.line, marginTop: 6, paddingTop: 6 },
        ]}
      >
        {data.map((ponto) => (
          <Txt
            key={ponto.mes}
            variant="meterSM"
            tone="muted"
            style={styles.rotuloEixo}
            numberOfLines={1}
          >
            {compacto ? ponto.rotulo.charAt(0) : ponto.rotulo}
          </Txt>
        ))}
      </View>
    </View>
  );
}

function descrever(data: GastoPorMes[]): string {
  const partes = data
    .filter((d) => d.total > 0)
    .map((d) => `${d.rotulo}: ${formatAmount(d.total)} reais`);

  if (partes.length === 0) return 'Gráfico sem gastos no período.';
  return `Evolução mensal. ${partes.join('. ')}.`;
}

/** Altura reservada acima das barras para o valor da maior. */
const ESPACO_ROTULO = 18;
/** Quanto o valor da barra pode passar da largura da coluna, de cada lado. */
const LARGURA_EXTRA = 28;

const styles = StyleSheet.create({
  area: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  coluna: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  barra: {
    width: '100%',
  },
  rotuloTopo: {
    position: 'absolute',
  },
  rotuloTexto: {
    fontSize: 11,
  },
  rotuloMeio: {
    left: -LARGURA_EXTRA,
    right: -LARGURA_EXTRA,
    alignItems: 'center',
  },
  rotuloInicio: {
    left: 0,
    right: -2 * LARGURA_EXTRA,
    alignItems: 'flex-start',
  },
  rotuloFim: {
    left: -2 * LARGURA_EXTRA,
    right: 0,
    alignItems: 'flex-end',
  },
  eixo: {
    flexDirection: 'row',
    gap: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rotuloEixo: {
    flex: 1,
    textAlign: 'center',
  },
});
