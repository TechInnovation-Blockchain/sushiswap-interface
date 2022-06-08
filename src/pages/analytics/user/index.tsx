import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { ChainId } from '@sushiswap/core-sdk'
import Typography from 'app/components/Typography'
import { XSUSHI } from 'app/config/tokens'
import InfoCard from 'app/features/analytics/bar/InfoCard'
import { formatNumber, formatPercent, shortenAddress } from 'app/functions'
import { TridentBody, TridentHeader } from 'app/layouts/Trident'
import {
  useNativePrice,
  useOneMonthBlock,
  useOneYearBlock,
  useSixMonthBlock,
  useThreeMonthBlock,
  useTokens,
} from 'app/services/graph'
import { useBar, useBarUser } from 'app/services/graph/hooks/bar'
import { useActiveWeb3React } from 'app/services/web3'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React from 'react'

export default function User() {
  const web3 = useActiveWeb3React()
  const router = useRouter()
  const account = (router.query.address as string) || web3.account

  const { i18n } = useLingui()

  const { data: block1m } = useOneMonthBlock({ chainId: ChainId.ETHEREUM })
  const { data: block3m } = useThreeMonthBlock({ chainId: ChainId.ETHEREUM })
  const { data: block6m } = useSixMonthBlock({ chainId: ChainId.ETHEREUM })
  const { data: block1y } = useOneYearBlock({ chainId: ChainId.ETHEREUM })

  const { data: ethPrice } = useNativePrice({ chainId: ChainId.ETHEREUM })

  const xSushi = useTokens({
    chainId: ChainId.ETHEREUM,
    variables: { where: { id: XSUSHI.address.toLowerCase() } },
  })?.[0]

  const { data: bar } = useBar()

  const { data: user } = useBarUser({ variables: { id: account }, shouldFetch: !!account })

  const { data: bar1m } = useBar({
    variables: {
      block: block1m,
    },
    shouldFetch: !!block1m,
  })

  const { data: bar3m } = useBar({
    variables: {
      block: block3m,
    },
    shouldFetch: !!block3m,
  })

  const { data: bar6m } = useBar({
    variables: {
      block: block6m,
    },
    shouldFetch: !!block6m,
  })

  const { data: bar1y } = useBar({
    variables: {
      block: block1y,
    },
    shouldFetch: !!block1y,
  })

  const apy1m = (bar?.ratio / bar1m?.ratio - 1) * 12 * 100

  const apy3m = (bar?.ratio / bar3m?.ratio - 1) * 4 * 100

  const apy6m = (bar?.ratio / bar6m?.ratio - 1) * 2 * 100

  const apy1y = (bar?.ratio / bar1y?.ratio - 1) * 100

  const [xSushiPrice, xSushiMarketcap] = [
    xSushi?.derivedETH * ethPrice,
    xSushi?.derivedETH * ethPrice * bar?.totalSupply,
  ]

  return (
    <>
      <NextSeo title={`Farm Analytics`} />

      <TridentHeader className="sm:!flex-row justify-between items-center" pattern="bg-bubble">
        <div>
          <Typography variant="h2" className="text-high-emphesis" weight={700}>
            {i18n._(t`User Analytics.`)}
          </Typography>
          <Typography variant="sm" weight={400}>
            {i18n._(t`Find out all about user here.`)}
          </Typography>
        </div>
      </TridentHeader>

      <TridentBody>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <InfoCard text="Price" number={formatNumber(xSushiPrice ?? 0, true)} />
            <InfoCard text="Market Cap" number={formatNumber(xSushiMarketcap ?? 0, true, false)} />
            <InfoCard text="Total Supply" number={formatNumber(bar?.totalSupply)} />
            <InfoCard text="xSUSHI : SUSHI" number={Number(bar?.ratio ?? 0)?.toFixed(4)} />
            {user && (
              <>
                <div className="col-span-2">
                  <InfoCard text="User Account" number={shortenAddress(user.id)} />
                </div>
                <InfoCard text="User Staked USD" number={formatNumber(user.sushiStakedUSD ?? 0, true, false)} />
                <InfoCard text="User Staked" number={formatNumber(user.sushiStaked ?? 0)} />
              </>
            )}
            <InfoCard text="APY 1m" number={formatPercent(apy1m)} />
            <InfoCard text="APY 3m" number={formatPercent(apy3m)} />
            <InfoCard text="APY 6m" number={formatPercent(apy6m)} />
            <InfoCard text="APY 1y" number={formatPercent(apy1y)} />
          </div>
        </div>
      </TridentBody>
    </>
  )
}
