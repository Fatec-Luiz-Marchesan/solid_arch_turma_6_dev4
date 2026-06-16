// src/domain/ports/IMetricsService.js

/**
 * @interface IMetricsService
 * @typedef {Object} IMetricsService
 * @property {function(string, Object?): void} incrementCounter
 * @property {function(string, number, Object?): void} recordHistogram
 * @property {function(string, number, Object?): void} observeGauge
 */