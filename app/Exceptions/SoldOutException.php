<?php

namespace App\Exceptions;

use Exception;

class SoldOutException extends Exception
{
    protected int $eventId;

    protected int $requestedQuantity;

    protected int $availableQuantity;

    public function __construct(
        int $eventId,
        int $requestedQuantity,
        int $availableQuantity,
        string $message = '',
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        $this->eventId = $eventId;
        $this->requestedQuantity = $requestedQuantity;
        $this->availableQuantity = $availableQuantity;

        if (empty($message)) {
            $message = $availableQuantity <= 0
                ? "Event #{$eventId} is sold out."
                : "Only {$availableQuantity} ticket(s) remaining for Event #{$eventId}, but {$requestedQuantity} requested.";
        }

        parent::__construct($message, $code, $previous);
    }

    public function getEventId(): int
    {
        return $this->eventId;
    }

    public function getRequestedQuantity(): int
    {
        return $this->requestedQuantity;
    }

    public function getAvailableQuantity(): int
    {
        return $this->availableQuantity;
    }
}
