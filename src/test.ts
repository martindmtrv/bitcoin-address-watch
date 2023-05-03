import mempoolJS from "@mempool/mempool.js";

const init = async () => {
  
  const { bitcoin: { addresses } } = mempoolJS({
    hostname: 'mempool.space'
  });

  const address = '1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv';
  const myAddress = await addresses.getAddress({ address });
  console.log(myAddress.chain_stats.funded_txo_sum -myAddress.chain_stats.spent_txo_sum);
  console.log(myAddress);
          
};

init();
