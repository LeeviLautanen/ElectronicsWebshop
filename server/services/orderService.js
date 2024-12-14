class orderService {
  constructor(pool, sentry) {
    this.pool = pool;
    this.sentry = sentry;
  }
}

module.exports = new OrderService(pool);
