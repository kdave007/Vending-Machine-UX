# TOM

Programa de TOM v2 realizado en Angular.js con integración de Electron.

---

## Requisitos de desarrollo

### Dependencias principales

1. Angular CLI
2. Node.js
3. Node SerialPort 
4. Electron
5. electron-packager

### Dependencias secundarias

Revisar **package.json**.

---

## Requisitos de instalación (ejecutable)

1. Node.js
2. Node SerialPort
3. Sistema operativo linux x64
4. Agregar el usuario de linux al grupo **uucp**

---

## Notas

1. Se debe de recompilar **Node SerialPort** una vez instalado **Electron**.

2. **Node SerialPort** presenta dificultades al compilar desde **Windows** para **Linux** *(Crosscompiling)* por lo cual al momento de crear el ejecutable se recomienda compilar dentro de un sistema operativo **Linux x64**.

3. Para corroborar el puerto serial a utilizar se puede utilizar el siguiente comando: 
```
'dmesg | grep tty'
```

## Referencias
- [Angular.js electron-packager](https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/)
- [Recompilar **Node SerialPort**](https://serialport.io/docs/guide-installation)
