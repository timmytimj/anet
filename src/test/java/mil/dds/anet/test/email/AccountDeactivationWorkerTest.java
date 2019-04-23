package mil.dds.anet.test.email;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.AnetEmail;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.PersonStatus;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.lists.AnetBeanList;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.emails.AccountDeactivationEmail;
import mil.dds.anet.emails.AccountDeactivationWarningEmail;
import mil.dds.anet.threads.AccountDeactivationWorker;
import mil.dds.anet.threads.AnetEmailWorker;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@RunWith(PowerMockRunner.class)
@PrepareForTest({AnetEmailWorker.class, AnetObjectEngine.class, AnetConfiguration.class,
    PersonDao.class, PositionDao.class, AccountDeactivationEmail.class,
    AccountDeactivationWarningEmail.class, Person.class})
public class AccountDeactivationWorkerTest {

  AnetConfiguration config;
  PersonDao personDao;
  PositionDao positionDao;

  private static final int SCHEDULER_TIME_MS = 1 * 1000;

  @Before
  public void setup() {
    config = PowerMockito.mock(AnetConfiguration.class, Mockito.RETURNS_MOCKS);
    personDao = PowerMockito.mock(PersonDao.class, Mockito.RETURNS_MOCKS);
    positionDao = PowerMockito.mock(PositionDao.class, Mockito.RETURNS_MOCKS);
    PowerMockito.mockStatic(AnetObjectEngine.class);

    when(config.getDictionaryEntry("automaticallyInactivateUsers.emailRemindersDaysPrior"))
        .thenReturn(Arrays.asList(15, 30, 45));
    when(config.getDictionaryEntry("automaticallyInactivateUsers.ignoredDomainNames"))
        .thenReturn(Arrays.asList("ignored_domain.com"));

    AnetObjectEngine instance = PowerMockito.mock(AnetObjectEngine.class);
    when(instance.getPersonDao()).thenReturn(personDao);

    when(instance.getPositionDao()).thenReturn(positionDao);
    when(AnetObjectEngine.getInstance()).thenReturn(instance);

    PowerMockito.mockStatic(AnetEmailWorker.class);
  }

  @Test
  public void testWarnings() throws Exception {

    // Configure
    Person testPerson14 = createDummyPerson(Instant.now().plus(14, ChronoUnit.DAYS),
        "test14@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    Person testPerson15 = createDummyPerson(Instant.now().plus(15, ChronoUnit.DAYS),
        "test15@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    Person testPerson30 = createDummyPerson(Instant.now().plus(30, ChronoUnit.DAYS),
        "test30@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    Person testPerson45 = createDummyPerson(Instant.now().plus(45, ChronoUnit.DAYS),
        "test45@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    Person testPerson46 = createDummyPerson(Instant.now().plus(46, ChronoUnit.DAYS),
        "test46@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    when(personDao.search(Mockito.any())).thenReturn(new AnetBeanList<>(
        Arrays.asList(testPerson14, testPerson15, testPerson30, testPerson45, testPerson46)));

    // Send email(s)
    AccountDeactivationWorker accountDeactivationWorker =
        new AccountDeactivationWorker(config, personDao, SCHEDULER_TIME_MS);
    accountDeactivationWorker.run();

    // Verify
    ArgumentCaptor<AnetEmail> captor = ArgumentCaptor.forClass(AnetEmail.class);
    PowerMockito.verifyPrivate(AnetEmailWorker.class, Mockito.times(3)).invoke("sendEmailAsync",
        captor.capture());

    List<AnetEmail> emails = captor.getAllValues();
    assertEquals(3, emails.size());

    assertTrue(
        emails.stream().anyMatch(e -> (e.getAction() instanceof AccountDeactivationWarningEmail)
            && e.getToAddresses().contains("test15@test.com")));
    assertTrue(
        emails.stream().anyMatch(e -> (e.getAction() instanceof AccountDeactivationWarningEmail)
            && e.getToAddresses().contains("test30@test.com")));
    assertTrue(
        emails.stream().anyMatch(e -> (e.getAction() instanceof AccountDeactivationWarningEmail)
            && e.getToAddresses().contains("test45@test.com")));
  }

  @Test
  public void testDeactivation() throws Exception {

    // Configure
    Person testPersonEotActive = createDummyPerson(Instant.now().minus(1, ChronoUnit.DAYS),
        "test_eot_acive@test.com", PersonStatus.ACTIVE, "anet_test_domain", new Position());

    Person testPersonEotInactive = createDummyPerson(Instant.now().minus(1, ChronoUnit.DAYS),
        "test_eot_inacive@test.com", PersonStatus.INACTIVE, "anet_test_domain", new Position());

    when(personDao.search(Mockito.any()))
        .thenReturn(new AnetBeanList<>(Arrays.asList(testPersonEotActive, testPersonEotInactive)));

    // Send email(s)
    AccountDeactivationWorker accountDeactivationWorker =
        new AccountDeactivationWorker(config, personDao, SCHEDULER_TIME_MS);
    accountDeactivationWorker.run();

    // Verify
    ArgumentCaptor<AnetEmail> captor = ArgumentCaptor.forClass(AnetEmail.class);
    PowerMockito.verifyPrivate(AnetEmailWorker.class, Mockito.times(1)).invoke("sendEmailAsync",
        captor.capture());

    PowerMockito.verifyPrivate(positionDao, Mockito.times(1)).invoke("removePersonFromPosition",
        Mockito.any());

    List<AnetEmail> emails = captor.getAllValues();
    assertEquals(1, emails.size());

    assertTrue(emails.stream().anyMatch(e -> (e.getAction() instanceof AccountDeactivationEmail)
        && e.getToAddresses().contains("test_eot_acive@test.com")));

  }

  @Test
  public void testIgnoredDomains() throws Exception {

    // Configure
    Person testPersonEotIgnored = createDummyPerson(Instant.now().minus(1, ChronoUnit.DAYS),
        "test_eot_acive@ignored_domain.com", PersonStatus.ACTIVE, "ignored_domain", new Position());

    Person testPerson15Ignored = createDummyPerson(Instant.now().plus(15, ChronoUnit.DAYS),
        "test15@ignored_domain.com", PersonStatus.ACTIVE, "ignored_domain", new Position());


    when(personDao.search(Mockito.any()))
        .thenReturn(new AnetBeanList<>(Arrays.asList(testPersonEotIgnored, testPerson15Ignored)));

    // Send email(s)
    AccountDeactivationWorker accountDeactivationWorker =
        new AccountDeactivationWorker(config, personDao, SCHEDULER_TIME_MS);
    accountDeactivationWorker.run();

    // Verify
    ArgumentCaptor<AnetEmail> captor = ArgumentCaptor.forClass(AnetEmail.class);
    PowerMockito.verifyPrivate(AnetEmailWorker.class, Mockito.times(0)).invoke("sendEmailAsync",
        captor.capture());

    List<AnetEmail> emails = captor.getAllValues();
    assertEquals(0, emails.size());
  }

  private static Person createDummyPerson(Instant endOfTour, String email, PersonStatus status,
      String domainName, Position position) {

    Person testPerson = PowerMockito.mock(Person.class);
    when(testPerson.getEndOfTourDate()).thenReturn(endOfTour);
    when(testPerson.getEmailAddress()).thenReturn(email);
    when(testPerson.getStatus()).thenReturn(status);
    when(testPerson.getDomainUsername()).thenReturn(domainName);
    when(testPerson.getPosition()).thenReturn(position);
    when(testPerson.loadPosition()).thenReturn(position);

    return testPerson;
  }
}
