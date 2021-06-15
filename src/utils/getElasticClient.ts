import { Client } from '@elastic/elasticsearch';

const elasticClient = new Client({ node: 'http://elastic:9200' });

export default elasticClient;
