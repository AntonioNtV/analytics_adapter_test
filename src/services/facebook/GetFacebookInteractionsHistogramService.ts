import api from '../../util/api';

interface Request {
    since: string;
    until: string;
    profile_ids: string[];
    timezone: string;
}

interface HistogramData {
    label: string;
    profile_id: string;
    value: number;
}

interface Response {
    data: HistogramData[];
}

interface ESResponse {
    aggregations: {
        volume: {
            buckets: Buckets[];
        };
    };
}

interface Buckets {
    key_as_string: string;
    consolidate: {
        buckets: SubBuckets[];
    };
}

interface SubBuckets {
    key: string;
    interactions: {
        value: number;
    };
}

class GetFacebookInteractionsHistogramService {
    public async execute({
        since,
        until,
        profile_ids,
        timezone,
    }: Request): Promise<Response> {
        const query = this.getQuery(since, until, profile_ids, timezone);

        console.log(query);
        // making request to ES
        const response = await api.post(
            '/bm-analytics-fb/_search?ignore_unavailable=true',
            query,
        );

        const esData: ESResponse = response.data;

        const data = this.parseData(esData);

        return { data };
    }

    private parseData(esData: ESResponse): HistogramData[] {
        const { buckets } = esData.aggregations.volume;
        const response: HistogramData[] = [];

        for (const bucket of buckets) {
            const { key_as_string: date, consolidate } = bucket;
            const { buckets: subBuckets } = consolidate;

            for (const subBucket of subBuckets) {
                const { interactions, key: profile_id } = subBucket;

                response.push({
                    profile_id,
                    value: interactions.value,
                    label: date,
                });
            }
        }

        return response;
    }

    private getQuery(
        since: string,
        until: string,
        profile_ids: string[],
        timezone: string,
    ): string {
        return `{
            "query": {
              "constant_score": {
                "filter": {
                  "and": [
                    {
                      "terms": {
                        "profile_id": ${JSON.stringify(profile_ids)}
                      }
                    },
                    {
                      "range": {
                        "taken_at": {
                          "from": "${since}",
                          "to": "${until}",
                          "time_zone": "${timezone}"
                        }
                      }
                    }
                  ]
                }
              }
            },
            "aggs": {
              "volume": {
                "date_histogram": {
                  "field": "taken_at",
                  "format": "yyyyMMddHHmmss",
                  "min_doc_count": 0,
                  "interval": "day",
                  "offset": "0"
                },
                "aggs": {
                  "consolidate": {
                    "terms": {
                      "field": "profile_id",
                      "min_doc_count": 1,
                      "size": 0
                    },
                    "aggs": {
                      "likes": {
                        "sum": {
                          "field": "likes.new"
                        }
                      },
                      "shares": {
                        "sum": {
                          "field": "shares.new"
                        }
                      },
                      "comments": {
                        "sum": {
                          "field": "comments.new"
                        }
                      },
                      "loves": {
                        "sum": {
                          "field": "loves.new"
                        }
                      },
                      "hahas": {
                        "sum": {
                          "field": "hahas.new"
                        }
                      },
                      "wows": {
                        "sum": {
                          "field": "wows.new"
                        }
                      },
                      "sorries": {
                        "sum": {
                          "field": "sorries.new"
                        }
                      },
                      "angers": {
                        "sum": {
                          "field": "angers.new"
                        }
                      },
                      "clicks": {
                        "sum": {
                          "field": "clicks.new"
                        }
                      },
                      "total_likes": {
                        "sum": {
                          "field": "likes_total.new"
                        }
                      },
                      "total_shares": {
                        "sum": {
                          "field": "shares_total.new"
                        }
                      },
                      "total_comments": {
                        "sum": {
                          "field": "comments_total.new"
                        }
                      },
                      "total_loves": {
                        "sum": {
                          "field": "loves_total.new"
                        }
                      },
                      "total_hahas": {
                        "sum": {
                          "field": "hahas_total.new"
                        }
                      },
                      "total_wows": {
                        "sum": {
                          "field": "wows_total.new"
                        }
                      },
                      "total_sorries": {
                        "sum": {
                          "field": "sorries_total.new"
                        }
                      },
                      "total_angers": {
                        "sum": {
                          "field": "angers_total.new"
                        }
                      },
                      "result": {
                        "bucket_script": {
                          "buckets_path": {
                            "likes": "likes",
                            "comments": "comments",
                            "shares": "shares",
                            "loves": "loves",
                            "hahas": "hahas",
                            "wows": "wows",
                            "sorries": "sorries",
                            "angers": "angers"
                          },
                          "script": "likes + comments + shares + loves + hahas + wows + sorries + angers"
                        }
                      },
                      "interactions": {
                        "bucket_script": {
                          "buckets_path": {
                            "total_likes": "total_likes",
                            "total_comments": "total_comments",
                            "total_shares": "total_shares",
                            "total_loves": "total_loves",
                            "total_hahas": "total_hahas",
                            "total_wows": "total_wows",
                            "total_sorries": "total_sorries",
                            "total_angers": "total_angers"
                          },
                          "script": "total_likes + total_comments + total_shares + total_loves + total_hahas + total_wows + total_sorries + total_angers"
                        }
                      }
                    }
                  }
                }
              }
            },
            "size": 0
          }     
        `;
    }
}

export default GetFacebookInteractionsHistogramService;
