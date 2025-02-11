import { Model, DataTypes, Sequelize } from 'sequelize';

export interface SensorAttributes {
  id: string;
  timestamp: Date;
  sensorType: string;
  value: number;
  latitude: number;
  longitude: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sensor extends Model<SensorAttributes> implements SensorAttributes {
  public id!: string;
  public timestamp!: Date;
  public sensorType!: string;
  public value!: number;
  public latitude!: number;
  public longitude!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof Sensor {
    Sensor.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      sensorType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    }, {
      sequelize,
      tableName: 'sensors',
      timestamps: true
    });
    
    return Sensor;
  }
}