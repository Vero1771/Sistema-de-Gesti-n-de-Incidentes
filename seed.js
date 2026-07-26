const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/incidentes_db';

const DepartmentSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const WorkCenterSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  ubicacion: { type: String, required: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const WorkerSchema = new mongoose.Schema({
  primer_nombre: { type: String, required: true },
  segundo_nombre: { type: String, default: null },
  primer_apellido: { type: String, required: true },
  segundo_apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  numero_trabajador: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  telefono: { type: String, default: null },
  genero: { type: String, enum: ['masculino', 'femenino', 'otro', 'prefiero_no_decir'], default: 'prefiero_no_decir' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  workCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkCenter', required: true },
  cargo: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  fecha_ingreso: { type: Date, required: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const ReportSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: { type: String, enum: ['incidente', 'accidente', 'riesgo', 'capacitacion', 'visita', 'otro'], required: true },
  severidad: { type: String, enum: ['baja', 'media', 'alta', 'critica'], default: 'media' },
  fecha_reporte: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pendiente', 'en_revision', 'resuelto', 'cerrado'], default: 'pendiente' },
  evidencias: { type: String, default: null },
  evidenciaData: { type: String, default: null },
  evidenciaTipo: { type: String, default: null },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'user'], default: 'user' },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const Department = mongoose.model('Department', DepartmentSchema);
const WorkCenter = mongoose.model('WorkCenter', WorkCenterSchema);
const Worker = mongoose.model('Worker', WorkerSchema);
const Report = mongoose.model('Report', ReportSchema);
const User = mongoose.model('User', UserSchema);

const departmentsData = [
  { nombre: 'Gerencia Estadal de Protecciones' },
  { nombre: 'Recursos Humanos' },
  { nombre: 'Tecnologia de la Informacion' },
  { nombre: 'Mantenimiento' },
  { nombre: 'Finanzas' },
  { nombre: 'Operaciones' }
];

const workCentersData = [
  { nombre: 'Torre Corpoelec', ubicacion: 'Av. Libertador, Caracas' },
  { nombre: 'Oficina Mezanotte', ubicacion: 'Centro Comercial Mezanotte, Piso 3, Caracas' },
  { nombre: 'Oficina Bocono', ubicacion: 'Calle 5, Bocono, Trujillo' },
  { nombre: 'Centro de Operaciones Este', ubicacion: 'Av. Francisco de Miranda, Caracas' },
  { nombre: 'Planta Termoelectrica', ubicacion: 'Zona Industrial, La Guaira' }
];

const workersData = [
  {
    primer_nombre: 'Maria',
    segundo_nombre: 'Jose',
    primer_apellido: 'Gonzalez',
    segundo_apellido: 'Perez',
    cedula: '12345678',
    numero_trabajador: '000001',
    email: 'maria.gonzalez@corpoelec.com',
    telefono: '0412-1234567',
    genero: 'femenino',
    cargo: 'Supervisora de Seguridad',
    fecha_nacimiento: new Date('1985-03-15'),
    fecha_ingreso: new Date('2010-06-01')
  },
  {
    primer_nombre: 'Carlos',
    segundo_nombre: 'Andres',
    primer_apellido: 'Rodriguez',
    segundo_apellido: 'Lopez',
    cedula: '87654321',
    numero_trabajador: '000002',
    email: 'carlos.rodriguez@corpoelec.com',
    telefono: '0424-7654321',
    genero: 'masculino',
    cargo: 'Analista de Recursos Humanos',
    fecha_nacimiento: new Date('1990-07-22'),
    fecha_ingreso: new Date('2015-02-15')
  },
  {
    primer_nombre: 'Ana',
    segundo_nombre: null,
    primer_apellido: 'Martinez',
    segundo_apellido: 'Suarez',
    cedula: '11223344',
    numero_trabajador: '000003',
    email: 'ana.martinez@corpoelec.com',
    telefono: '0416-9876543',
    genero: 'femenino',
    cargo: 'Desarrolladora de Software',
    fecha_nacimiento: new Date('1992-11-10'),
    fecha_ingreso: new Date('2018-09-20')
  },
  {
    primer_nombre: 'Pedro',
    segundo_nombre: 'Luis',
    primer_apellido: 'Fernandez',
    segundo_apellido: 'Gomez',
    cedula: '55667788',
    numero_trabajador: '000004',
    email: 'pedro.fernandez@corpoelec.com',
    telefono: '0412-5544332',
    genero: 'masculino',
    cargo: 'Tecnico de Mantenimiento',
    fecha_nacimiento: new Date('1988-05-20'),
    fecha_ingreso: new Date('2012-11-15')
  },
  {
    primer_nombre: 'Laura',
    segundo_nombre: 'Carolina',
    primer_apellido: 'Rojas',
    segundo_apellido: 'Mendoza',
    cedula: '99887766',
    numero_trabajador: '000005',
    email: 'laura.rojas@corpoelec.com',
    telefono: '0424-1122334',
    genero: 'femenino',
    cargo: 'Analista Financiero',
    fecha_nacimiento: new Date('1995-09-08'),
    fecha_ingreso: new Date('2020-03-10')
  }
];

const reportsData = [
  {
    titulo: 'Incidente en area de mantenimiento',
    descripcion: 'Se reporto un cortocircuito en el panel electrico del area de mantenimiento. No hubo heridos pero se requiere revision inmediata del sistema electrico.',
    tipo: 'incidente',
    severidad: 'media',
    estado: 'pendiente',
    evidencias: 'incidente_mantenimiento_2024-01-15.pdf',
    fecha_reporte: new Date('2024-01-15T10:30:00')
  },
  {
    titulo: 'Capacitacion en seguridad electrica',
    descripcion: 'Se realizo capacitacion sobre protocolos de seguridad electrica para 15 trabajadores del area de mantenimiento. La capacitacion fue exitosa y se entregaron certificados.',
    tipo: 'capacitacion',
    severidad: 'baja',
    estado: 'resuelto',
    evidencias: 'capacitacion_seguridad_electrica_fotos.zip',
    fecha_reporte: new Date('2024-01-20T14:00:00')
  },
  {
    titulo: 'Riesgo en escaleras de emergencia',
    descripcion: 'Se detecto que las escaleras de emergencia del piso 5 presentan corrosion en los pasamanos y barandales. Se requiere mantenimiento urgente para evitar accidentes.',
    tipo: 'riesgo',
    severidad: 'alta',
    estado: 'en_revision',
    evidencias: 'escaleras_piso5_fotos.pdf',
    fecha_reporte: new Date('2024-02-01T09:15:00')
  },
  {
    titulo: 'Visita de inspeccion a planta termoelectrica',
    descripcion: 'Se realizo visita de inspeccion a la planta termoelectrica. Se verificaron todos los sistemas de seguridad y se encontraron en buen estado.',
    tipo: 'visita',
    severidad: 'baja',
    estado: 'cerrado',
    evidencias: 'inspeccion_planta_2024-02-10.docx',
    fecha_reporte: new Date('2024-02-10T11:00:00')
  },
  {
    titulo: 'Accidente menor en oficina central',
    descripcion: 'Un trabajador sufrio una caida en la oficina central debido a un piso resbaladizo. Se aplicaron primeros auxilios y se traslado al centro medico para evaluacion.',
    tipo: 'accidente',
    severidad: 'media',
    estado: 'pendiente',
    evidencias: 'accidente_oficina_fotos.pdf',
    fecha_reporte: new Date('2024-02-15T08:45:00')
  },
  {
    titulo: 'Revision de equipos de proteccion personal',
    descripcion: 'Se realizo revision de los equipos de proteccion personal (EPP) de todo el personal. Se encontro que el 20% de los equipos necesitan ser reemplazados por desgaste.',
    tipo: 'riesgo',
    severidad: 'media',
    estado: 'en_revision',
    evidencias: 'revision_epp_informe.pdf',
    fecha_reporte: new Date('2024-02-20T13:00:00')
  },
  {
    titulo: 'Simulacro de evacuacion',
    descripcion: 'Se realizo simulacro de evacuacion en todas las instalaciones. Participaron 150 trabajadores y se completo en 3 minutos, cumpliendo con los tiempos establecidos.',
    tipo: 'capacitacion',
    severidad: 'baja',
    estado: 'resuelto',
    evidencias: 'simulacro_evacuacion_fotos.zip',
    fecha_reporte: new Date('2024-03-01T10:00:00')
  },
  {
    titulo: 'Incidente con sistema de climatizacion',
    descripcion: 'El sistema de climatizacion del piso 8 presento una falla causando sobrecalentamiento en el servidor principal. Se activaron los protocolos de emergencia y se restauro el servicio en 2 horas.',
    tipo: 'incidente',
    severidad: 'alta',
    estado: 'pendiente',
    evidencias: 'incidente_climatizacion_informe.pdf',
    fecha_reporte: new Date('2024-03-05T15:30:00')
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');
    console.log(`   Base de datos: ${mongoose.connection.db.databaseName}`);

    await Department.deleteMany({});
    await WorkCenter.deleteMany({});
    await Worker.deleteMany({});
    await Report.deleteMany({});
    await User.deleteMany({});
    console.log('Datos existentes eliminados');

    const departments = await Department.insertMany(departmentsData);
    console.log(`${departments.length} departamentos creados`);

    const workCenters = await WorkCenter.insertMany(workCentersData);
    console.log(`${workCenters.length} centros de trabajo creados`);

    const workers = [];
    for (let i = 0; i < workersData.length; i++) {
      const w = workersData[i];
      const worker = new Worker({
        ...w,
        departmentId: departments[i % departments.length]._id,
        workCenterId: workCenters[i % workCenters.length]._id
      });
      workers.push(await worker.save());
    }
    console.log(`${workers.length} trabajadores creados`);

    for (let i = 0; i < reportsData.length; i++) {
      const r = reportsData[i];
      const report = new Report({
        ...r,
        workerId: workers[i % workers.length]._id
      });
      await report.save();
    }
    console.log(`${reportsData.length} reportes creados`);

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({
      nombre: 'Administrador',
      email: 'admin@corpoelec.com',
      password: hashedPassword,
      rol: 'admin'
    });
    await user.save();
    console.log('Usuario administrador creado');
    console.log('   Email: admin@corpoelec.com');
    console.log('   Contrasena: admin123');

    console.log('\nDatos de ejemplo insertados correctamente');
    console.log('Resumen:');
    console.log(`   - ${departments.length} departamentos`);
    console.log(`   - ${workCenters.length} centros de trabajo`);
    console.log(`   - ${workers.length} trabajadores`);
    console.log(`   - ${reportsData.length} reportes`);
    console.log(`   - 1 usuario administrador`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedDatabase();