import { Usuario } from '../../../login/shared/models/usuario.model';

export class Hospital {
  constructor(
    public nombre: number,
    public img?: string,
    public usuario?: Usuario,
    public _id?: string
  ) {}
}