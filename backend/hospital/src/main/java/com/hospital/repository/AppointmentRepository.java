package com.hospital.repository;

import com.hospital.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // For patient appointments page
    List<Appointment> findByPatientPatientIdOrderByAppointmentDateDesc(Long patientId);

    // Fixed: underscore tells JPA to traverse the Doctor relationship then find id
    List<Appointment> findByDoctor_IdOrderByAppointmentDateDesc(Long doctorId);
}