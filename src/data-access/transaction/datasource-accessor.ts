import { DataSource } from 'typeorm';

let _dataSource: DataSource | undefined;

export function initializeDataSource(dataSource: DataSource): void {
  _dataSource = dataSource;
}

export function getDataSource(): DataSource {
  if (!_dataSource) {
    throw new Error(
      'DataSource singleton not initialized — ensure TransactionModule is loaded.',
    );
  }
  return _dataSource;
}
