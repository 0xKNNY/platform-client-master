import { useRouter } from "next/router";
import { ChainIdentifier, useNFT, ArtivaContext } from "@artiva/shared";
import { NFTProps } from "@artiva/shared";
import { NFTObject } from "@zoralabs/nft-hooks";
import { Fragment } from "react";
import { useContext } from "react";
import useThemeComponent from "@/hooks/theme/useThemeComponent";
import useInitTheme from "@/hooks/theme/useInitTheme";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getPlatformMetadataByPlatform } from "@/services/platform-graph";
import { getNFTPrimaryData } from "@/services/nft";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { platform: platformContract } = context.query;
  const platform = (await getPlatformMetadataByPlatform(
    platformContract as string
  ))!;

  const { chain, contract, tokenid } = context.query;

  const data = await getNFTPrimaryData({
    chain: chain as ChainIdentifier,
    contractAddress: contract as string,
    tokenId: tokenid as string,
  });
  const jsonData = JSON.parse(JSON.stringify(data));

  return {
    props: {
      platform,
      data: jsonData,
    },
  };
};

const NFT = ({
  platform,
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const {
    query: { platform: platformId },
  } = useRouter();
  const ctx = useContext(ArtivaContext);

  const { themeURL } = useInitTheme({ platform });

  const NFTComponentDynamic = useThemeComponent<NFTProps>({
    component: "./NFT",
    themeURL,
  });

  const props: NFTProps = {
    nft: data as NFTObject,
    ctx,
    platform: { ...platform, id: platformId as string },
  };

  if (!NFTComponentDynamic) return <Fragment />;
  return <NFTComponentDynamic {...props} />;
};

export default NFT;
