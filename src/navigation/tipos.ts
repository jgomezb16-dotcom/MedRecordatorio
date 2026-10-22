import { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Registro: undefined;
};

export type TabsParamList = {
  Hoy: undefined;
  Medicamentos: undefined;
  Historial: undefined;
  Perfil: undefined;
};

export type AppStackParamList = {
  Principal: NavigatorScreenParams<TabsParamList>;
  NuevoMedicamento: undefined;
};