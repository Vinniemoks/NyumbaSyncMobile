// Sign-in can pause at a gate instead of returning a session: a forced first
// password change, or an emailed code for an admin on a new network. Returns
// true when it routed to one, so callers stop and wait for that screen.
export function routeLoginGate(data, navigation) {
  if (data?.requirePasswordChange && data.token) {
    navigation.navigate('ForcedPasswordChange', { token: data.token });
    return true;
  }
  if (data?.requireIpVerification && data.ipSessionToken) {
    navigation.navigate('IpVerify', { ipSessionToken: data.ipSessionToken, message: data.message });
    return true;
  }
  return false;
}
