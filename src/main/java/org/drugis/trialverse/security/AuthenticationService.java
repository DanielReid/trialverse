package org.drugis.trialverse.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Created by daan on 25-3-15.
 */
@Service
public class AuthenticationService {
  public TrialversePrincipal getAuthentication() {
    return new TrialversePrincipal(SecurityContextHolder.getContext().getAuthentication());
  }
}
