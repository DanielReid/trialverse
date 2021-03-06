/*
 * Copyright 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.drugis.trialverse.security.repository;

import org.drugis.trialverse.security.Account;
import org.drugis.trialverse.security.TooManyAccountsException;
import org.drugis.trialverse.security.UsernameAlreadyInUseException;

import java.util.List;

public interface AccountRepository {

  void createAccount(String email, String firstName, String lastName) throws UsernameAlreadyInUseException;

  Account findAccountByUsername(String username);

  Account get(int id);

  Account findAccountByHash(String hash);

  Account findAccountByActiveApplicationKey(String applicationKey) throws TooManyAccountsException;

  List<Account> getUsers();
}
