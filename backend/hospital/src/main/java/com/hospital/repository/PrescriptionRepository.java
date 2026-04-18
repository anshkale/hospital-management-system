package com.hospital.repository;

import com.hospital.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientPatientIdOrderByPrescribedDateDesc(Long patientId);
    List<Prescription> findByDoctorIdOrderByPrescribedDateDesc(Long doctorId);
}