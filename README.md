# TOM V2 Interface

Interfaz de TOM v2 realizada en Angular.js con integración de Electron.

---

## Requisitos de desarrollo

### Dependencias principales

1. Angular CLI
2. Node.js
3. Node SerialPort 
4. Electron
5. electron-packager
6. Node Net

### Dependencias secundarias

Revisar **package.json**.

---

## Requisitos de instalación (ejecutable)

1. Node.js
2. Node SerialPort
3. Sistema operativo linux x64
4. Agregar el usuario de linux al grupo **uucp**
5. Node Net
6. MariaDB

---

## Base de datos

**1) Se debe de instalar *mariaDB* con el siguiente comando:**

```
sudo pacman -S mysql
```

**2) Inicializar con el siguiente comando:**

```
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```

**3) Iniciar el servicio:**

```
sudo systemctl start mariadb
```

**4) Cambiar la contraseña del usuario *root* a la contraseña *atechnik* con el siguiente comando:**

```
sudo mysql_secure_installation
```

**5) Configurar el servicio como auto-arranque:**

```
sudo systemctl enable mariadb
```

**6) Inicar sesión:**

```
mysql -u root -p
```

**7) Crear base de datos:**

```
CREATE DATABASE tom;
```

**8) Crear tablas:**

  **1. toppings:** Contiene las cantidades restantes de cada topping en onzas (25oz máximo) donde:
  
    - T1: Capacidad restante del Topping 1.
    - T2: Capacidad restante del Topping 2.
    - T3: Capacidad restante del Topping 3.
    - T4: Capacidad restante del Topping 4.

  ```
  CREATE TABLE toppings (T1 FLOAT, T2 FLOAT, T3 FLOAT, T4 FLOAT);
  INSERT INTO toppings VALUES(25,25,25,25);
  ```

  **2. sales:** Contiene el registro de ventas donde:

    - T1: Topping 1 donde 1 es seleccionado y 0 es no seleccionado.
    - T2: Topping 2 donde 1 es seleccionado y 0 es no seleccionado.
    - T3: Topping 3 donde 1 es seleccionado y 0 es no seleccionado.
    - T4: Topping 4 donde 1 es seleccionado y 0 es no seleccionado.
    - NT: Ningún topping seleccionado cuando es 1.
    - toast: Nivel de tostado donde:
      - 10: Nivel de tostado bajo.
      - 11: Nivel de tostado medio.
      - 12: Nivel de tostado alto.

  ```
  CREATE TABLE sales (date_time DATETIME DEFAULT CURRENT_TIMESTAMP, T1 BOOLEAN, T2 BOOLEAN, T3 BOOLEAN, T4 BOOLEAN, NT BOOLEAN, toast INT);
  ```

  **3. motor:** Contiene los parámetros del motor de la banda de topping:

    - speed: Velocidad del motor en mm/s.

  ```
  CREATE TABLE motor (speed float);
  INSERT FROM motor VALUES(40);
  ```
  
---

## Notas

1. Se debe de recompilar **Node SerialPort** una vez instalado **Electron**.

2. **Node SerialPort** presenta dificultades al compilar desde **Windows** para **Linux** *(Crosscompiling)* por lo cual al momento de crear el ejecutable se recomienda compilar dentro de un sistema operativo **Linux x64**.

3. Para corroborar el puerto serial a utilizar se puede utilizar el siguiente comando: 
```
'dmesg | grep tty'
```
4. Si se cambia la versión de **Node SerialPort** o **Electron** se debe de recompilar **Node SerialPort**.

5. Si se requiere corroborar la versión de algún paquete **local** se puede utilizar el siguiente comando donde *package-name* es el nombre del paquete:

```
npm list package-name
```

o para mostrar todos los paquetes locales:

```
npm list
```

o para mostrar todos lo paquetes globales:

```
npm list -g
```

6. Si al instalar un paquete da *error 404* ejecutar el siguiente comando:
```
sudo pacman -Sy
```

## Referencias
- [Angular.js electron-packager](https://angularfirebase.com/lessons/desktop-apps-with-electron-and-angular/)
- [Recompilar **Node SerialPort**](https://serialport.io/docs/guide-installation)
