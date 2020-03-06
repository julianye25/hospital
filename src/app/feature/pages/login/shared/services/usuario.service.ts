import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { apiUsuario, apiLogin, apiLoginGoogle, apiUpload } from 'src/app/shared/config/config';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PeticionesService } from 'src/app/core/services/peticiones.service';
import { isNullOrUndefined } from 'util';
import { SwalService } from '../../../../../shared/services/swal.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  usuario: Usuario;
  token: string;

  constructor(
    private peticionesService: PeticionesService,
    private router: Router,
    private translateService: TranslateService,
    private swalService: SwalService
  ) {
    this.cargarStorage();
  }

  cargarStorage() {
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token');
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
    } else {
      this.token = '';
      this.usuario = null;
    }
  }

  guardarStorage(id: string, token: string, usuario: Usuario) {
    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.token = token;
    this.usuario = usuario;
  }

  estaLogueado() {
    const tamanioToken = 5;
    return this.token.length > tamanioToken;
  }

  iniciarSesion(usuario: Usuario, recordarme = false, google = false, token = null) {
    if (recordarme) {
      localStorage.setItem('email', usuario.email);
    } else {
      localStorage.removeItem('email');
    }
    return this.peticionesService.post(google ? apiLoginGoogle : apiLogin, token ? { token } : usuario).pipe(
      map((respuesta: any) => {
        this.guardarStorage(respuesta._id, respuesta.token, respuesta.usuario);
        return respuesta.usuario.nombre;
      })
    );
  }

  iniciarSesionGoogle(token) {
    return this.iniciarSesion(null, false, true, token);
  }

  cerrarSesion() {
    this.usuario = null;
    this.token = '';
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  crearUsuario(usuario: Usuario) {
    return this.peticionesService.post(apiUsuario, usuario).pipe(
      map((respuesta: any) => {
        return respuesta.usuario;
      })
    );
  }

  actualizarUsuario(usuario: Usuario) {
    return this.peticionesService.put(`${apiUsuario}/${this.usuario._id}?token=${this.token}`, usuario).pipe(
      map((respuesta: any) => {
        this.usuario = respuesta.usuario;
        this.guardarStorage(respuesta.usuario._id, this.token, respuesta.usuario);
        if (localStorage.getItem('email')) {
          localStorage.setItem('email', respuesta.usuario.email);
        }
        return respuesta.usuario;
      })
    );
  }

  actualizarImagen(archivo) {
    let peticion;
    if (!isNullOrUndefined(archivo)) {
      const formData = new FormData();
      formData.append('imagen', archivo, archivo.name);
      peticion = this.peticionesService.put(`${apiUpload}/usuario/${this.usuario._id}`, formData, undefined, true).pipe(
        map((respuesta: any) => {
          this.usuario = respuesta.usuario;
          this.swalService.toast(this.translateService.instant('PhotoUpdateSuccess'));
          this.guardarStorage(respuesta.usuario._id, this.token, respuesta.usuario);
          return respuesta;
        })
      );
    }
    return peticion;
  }
}