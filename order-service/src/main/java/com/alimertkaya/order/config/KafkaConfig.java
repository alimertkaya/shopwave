package com.alimertkaya.order.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Slf4j
@Configuration
public class KafkaConfig {

    /**
     * İşlenemeyen Kafka mesajları {topic}.DLQ topic'ine yönlendirilir.
     * 2 deneme, 1 sn ara — sonra DLQ.
     */
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, String> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate,
                (ConsumerRecord<?, ?> record, Exception ex) -> {
                    log.error("Mesaj işlenemedi, DLQ'ya gönderiliyor. Topic: {}, Hata: {}",
                            record.topic(), ex.getMessage());
                    return new org.apache.kafka.common.TopicPartition(
                            record.topic() + ".DLQ", record.partition());
                });

        return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 2));
    }
}
