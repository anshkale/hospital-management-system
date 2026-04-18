package com.hospital.repository;

import com.hospital.entity.PatientHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientHistoryRepository extends JpaRepository<PatientHistory, Long> {
    List<PatientHistory> findByPatientPatientIdOrderByVisitDateDesc(Long patientId);
}