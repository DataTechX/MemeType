
import EnvLoader from './classes/EventsxLoader';
EnvLoader.load();

import moment from 'moment-timezone';
moment.locale('th');
moment.tz.setDefault('Thailand/Bangkok');

import client from './client';
client.login(client.config.token);


// เริ่มต้นการทำงาน