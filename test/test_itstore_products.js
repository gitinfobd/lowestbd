const { fetchHtml } = require('../src/utils/curlFetcher');

async function dumpItStoreProducts() {
  const itHtml = await fetchHtml(`https://itstore.com.bd/?s=Nitro&post_type=product`, { timeout: 8000 });
  if (itHtml) {
    const pIdx = itHtml.indexOf('class="product-title"');
    console.log('product-title index:', pIdx);
    const pIdx2 = itHtml.indexOf('woocommerce-loop-product__title');
    console.log('woocommerce-loop-product__title index:', pIdx2);
    const pIdx3 = itHtml.indexOf('itstore.com.bd/product/');
    console.log('itstore product link index:', pIdx3);
    if (pIdx3 !== -1) {
      console.log('Snippet around product link:');
      console.log(itHtml.substring(pIdx3 - 50, pIdx3 + 400));
    }
  }
}

dumpItStoreProducts();
